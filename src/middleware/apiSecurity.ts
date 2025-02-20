import { auditLog, AuditLogType } from '../utils/auditLogger';

const API_RATE_LIMIT = 100; // requests per window
const API_RATE_WINDOW = 60 * 1000; // 1 minute window

interface RateLimitInfo {
  count: number;
  firstRequest: number;
}

const rateLimitStore = new Map<string, RateLimitInfo>();

export const apiSecurityMiddleware = {
  /**
   * Validates and sanitizes API request parameters
   */
  validateRequest: (params: Record<string, any>) => {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      // Remove any potential XSS or injection attempts
      if (typeof value === 'string') {
        sanitized[key] = value
          .replace(/[<>]/g, '') // Remove < and >
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove onclick= and similar
          .trim();
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  },

  /**
   * Checks rate limiting for API requests
   */
  checkRateLimit: (identifier: string): boolean => {
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
        AuditLogType.SECURITY_EVENT,
        'API rate limit exceeded',
        { identifier, count: info.count }
      );
      return false;
    }

    return true;
  },

  /**
   * Validates API tokens and permissions
   */
  validateApiAccess: async (token: string, requiredPermissions: string[]) => {
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
        AuditLogType.SECURITY_EVENT,
        'API access denied',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  },

  /**
   * Validates and sanitizes file uploads
   */
  validateFileUpload: (file: File) => {
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
  }
};
