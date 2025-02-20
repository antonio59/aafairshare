import { supabase } from '../supabase';

export enum AuditLogType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  USER_UPDATE = 'user_update',
  DATA_CREATE = 'data_create',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  ADMIN_ACTION = 'admin_action',
  SECURITY_EVENT = 'security_event'
}

interface AuditLogEntry {
  type: AuditLogType;
  userId?: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export const auditLog = async (
  type: AuditLogType,
  action: string,
  details: Record<string, any>,
  userId?: string
) => {
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
    if (type === AuditLogType.SECURITY_EVENT) {
      console.warn('Security Event:', action, sanitizedDetails);
    }
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Sanitize sensitive information before logging
function sanitizeLogDetails(details: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'ssn'];
  const sanitized = { ...details };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogDetails(sanitized[key]);
    }
  });

  return sanitized;
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
