import { auditLog, AUDIT_LOG_TYPE } from '../utils/auditLogger';
import DOMPurify from 'isomorphic-dompurify';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

interface RateLimitConfig {
  requestsPerWindow: number;
  windowMs: number;
}

interface RateLimitInfo {
  count: number;
  firstRequest: number;
}

interface ValidationConfig {
  allowHtml?: boolean;
  allowDataUrls?: boolean;
  maxDepth?: number;
}

interface ApiSecurityConfig {
  rateLimit: RateLimitConfig;
  validation: ValidationConfig;
}

const DEFAULT_CONFIG: ApiSecurityConfig = {
  rateLimit: {
    requestsPerWindow: 100,
    windowMs: 60 * 1000 // 1 minute
  },
  validation: {
    allowHtml: false,
    allowDataUrls: false,
    maxDepth: 10
  }
};

const rateLimitStore = new Map<string, RateLimitInfo>();

const API_RATE_LIMIT = 100;
const API_RATE_WINDOW = 60 * 1000; // 1 minute

function createSecurityMiddleware(config: Partial<ApiSecurityConfig> = {}) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    rateLimit: {
      ...DEFAULT_CONFIG.rateLimit,
      ...config.rateLimit
    },
    validation: {
      ...DEFAULT_CONFIG.validation,
      ...config.validation
    }
  };

  const validateRequest = (params: Record<string, any>) => {
    const sanitized: Record<string, any> = {};
    
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Use DOMPurify for strings
        const sanitizedString = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          ALLOW_DATA_ATTR: false,
          USE_PROFILES: { html: false },
          SANITIZE_DOM: true
        });
        
        // Additional protocol and script checks
        return sanitizedString
          .replace(/[<>]/g, '')
          .replace(/javascript:|data:|vbscript:|file:/gi, '')
          .replace(/on\w+=/gi, '')
          .replace(/expression\(|eval\(|function\(|setTimeout\(|setInterval\(/gi, '')
          .trim();
      }
      
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      
      if (typeof value === 'object' && value !== null) {
        const sanitizedObj: Record<string, any> = {};
        for (const [k, v] of Object.entries(value)) {
          sanitizedObj[k] = sanitizeValue(v);
        }
        return sanitizedObj;
      }
      
      return value;
    };
    
    for (const [key, value] of Object.entries(params)) {
      sanitized[key] = sanitizeValue(value);
    }
    
    return sanitized;
  };

  const checkRateLimit = (identifier: string): boolean => {
    const now = Date.now();
    const info = rateLimitStore.get(identifier) || { count: 0, firstRequest: now };

    // Reset if window has passed
    if (now - info.firstRequest > API_RATE_WINDOW) {
      info.count = 0;
      info.firstRequest = now;
    }

    // Increment count
    info.count++;

    // Update store
    rateLimitStore.set(identifier, info);

    // Check if limit exceeded
    if (info.count > API_RATE_LIMIT) {
      auditLog(
        AUDIT_LOG_TYPE.SECURITY_EVENT,
        'API rate limit exceeded',
        { identifier, count: info.count }
      );
      return false;
    }

    return true;
  };

  const validateApiAccess = async (token: string, requiredPermissions: string[]) => {
    try {
      // Verify token format
      if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
        throw new Error('Invalid token format');
      }

      // Get user from token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error('Invalid token');
      }

      // Check permissions (implement your permission logic here)
      const hasPermission = requiredPermissions.every(permission => 
        user.app_metadata?.permissions?.includes(permission)
      );

      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      return true;
    } catch (error) {
      await auditLog(
        AUDIT_LOG_TYPE.SECURITY_EVENT,
        'API access denied',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  };

  const validateFileUpload = (file: File) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds limit');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    // Additional checks could be added here (virus scan, etc.)
    return true;
  };

  return {
    validateRequest,
    checkRateLimit,
    validateApiAccess,
    validateFileUpload
  };
}
