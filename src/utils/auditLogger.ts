'use server';

import { supabase } from '../supabase';
import type { SecurityAlert } from '../types/security';

// Define audit log types as a constant map to ensure type safety
export const AUDIT_LOG_TYPE = {
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  USER_UPDATE: 'user_update',
  DATA_CREATE: 'data_create',
  DATA_UPDATE: 'data_update',
  DATA_DELETE: 'data_delete',
  ADMIN_ACTION: 'admin_action',
  SECURITY_EVENT: 'security_event'
} as const;

// Type for audit log types
export type AuditLogType = typeof AUDIT_LOG_TYPE[keyof typeof AUDIT_LOG_TYPE];

export interface AuditLogDetails {
  [key: string]: unknown;
  type?: string;
  severity?: string;
  message?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface AuditLogEntry {
  type: AuditLogType;
  userId?: string;
  action: string;
  details: AuditLogDetails;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error';
  source?: string;
  correlationId?: string;
}

export async function auditLog(
  type: AuditLogType,
  action: string,
  details: AuditLogDetails,
  userId?: string
): Promise<void> {
  try {
    // Get client IP and user agent if available
    const ipAddress = typeof window !== 'undefined' ? 
      await fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => data.ip) :
      undefined;
    
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

    // Sanitize sensitive information from details
    const sanitizedDetails = sanitizeLogDetails(details);

    const logEntry: AuditLogEntry = {
      type,
      userId,
      action,
      details: sanitizedDetails,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    };

    // Store in Supabase
    const { error } = await supabase
      .from('audit_logs')
      .insert(logEntry);

    if (error) {
      console.error('Failed to write audit log:', error);
      
      // Fallback to local storage if database write fails
      const fallbackLogs = JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
      fallbackLogs.push(logEntry);
      localStorage.setItem('audit_logs_fallback', JSON.stringify(fallbackLogs));
    }

    // For security events, also log to console
    if (type === AUDIT_LOG_TYPE.SECURITY_EVENT) {
      console.warn('Security Event:', action, sanitizedDetails);
    }
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

// Enhanced sensitive information sanitization for logging
type SanitizedValue = string | number | boolean | null | undefined | Record<string, unknown> | SanitizedValue[];

// Comprehensive list of sensitive field patterns
const sensitivePatterns = [
  // Authentication & Authorization
  /pass(word)?/i,
  /auth/i,
  /jwt/i,
  /token/i,
  /secret/i,
  /key/i,
  /api[-_]?key/i,
  /access[-_]?token/i,
  /refresh[-_]?token/i,
  
  // Personal Information
  /ssn/i,
  /social[-_]?security/i,
  /credit[-_]?card/i,
  /card[-_]?number/i,
  /cvv/i,
  /pin/i,
  
  // Contact Information
  /phone/i,
  /address/i,
  /zip/i,
  /postal/i,
  
  // Financial Information
  /account/i,
  /routing/i,
  /swift/i,
  /iban/i,
  
  // Healthcare Information
  /health/i,
  /medical/i,
  /diagnosis/i,
  /treatment/i
];

function sanitizeLogDetails(details: unknown): AuditLogDetails {
  if (!details || typeof details !== 'object') return {};
  
  // If it's a SecurityAlert, convert it to AuditLogDetails format
  if (details && typeof details === 'object' && 'type' in details && 'severity' in details && 'message' in details) {
    const alert = details as SecurityAlert;
    return {
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      details: sanitizeObject(alert.details),
      metadata: sanitizeObject(alert.metadata),
      timestamp: alert.timestamp
    };
  }

  const sanitizedResult = sanitizeObject(details as Record<string, unknown>);
  return sanitizedResult as AuditLogDetails;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, SanitizedValue> {
  const result: Record<string, SanitizedValue> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeValue(key, value);
  }
  
  return result;
}

function isSensitive(key: string, value: string | number | boolean | null | undefined): boolean {
  // Check key against patterns
  if (sensitivePatterns.some((pattern: RegExp) => pattern.test(key))) {
    return true;
  }

  // Check if value looks like a token/key
  if (typeof value === 'string') {
    // Token patterns (long strings of letters, numbers, and special characters)
    if (/^[A-Za-z0-9+/=_-]{32,}$/.test(value)) {
      return true;
    }
    
    // Common token prefixes
    if (/^(Bearer|Basic|Digest)\s+/.test(value)) {
      return true;
    }
    
    // URL with query parameters containing sensitive data
    if (value.includes('?') && sensitivePatterns.some((pattern: RegExp) => 
      pattern.test(value.substring(value.indexOf('?')))
    )) {
      return true;
    }
  }

  return false;
}

function sanitizeValue(key: string, value: unknown): SanitizedValue {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(key, item));
    }
    return sanitizeObject(value as Record<string, unknown>);
  }

  // Only check for sensitive data on primitive types
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    if (isSensitive(key, value)) {
      return '[REDACTED]';
    }
  }

  return value as SanitizedValue;
}

// Utility function to sync fallback logs to database
export const syncFallbackLogs = async () => {
  const fallbackLogs = JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
  if (fallbackLogs.length === 0) return;

  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert(fallbackLogs);

    if (!error) {
      localStorage.removeItem('audit_logs_fallback');
    }
  } catch (error) {
    console.error('Failed to sync fallback logs:', error);
  }
};
