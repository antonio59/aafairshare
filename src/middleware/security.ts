import { getSecurityHeaders } from '../utils/securityUtils';

// Apply security headers to all responses
export const applySecurityHeaders = () => {
  if (typeof window !== 'undefined') {
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      if (document.head.querySelector(`meta[http-equiv="${key}"]`)) {
        document.head.querySelector(`meta[http-equiv="${key}"]`)?.remove();
      }
      const meta = document.createElement('meta');
      meta.httpEquiv = key;
      meta.content = value;
      document.head.appendChild(meta);
    });
  }
};

// CORS configuration
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// Session management middleware
const activeTokens = new Set<string>();
const MAX_SESSIONS = 3;

export const sessionManager = {
  addSession: (token: string) => {
    activeTokens.add(token);
    if (activeTokens.size > MAX_SESSIONS) {
      // Remove oldest session
      const [oldestToken] = activeTokens;
      activeTokens.delete(oldestToken);
    }
  },

  removeSession: (token: string) => {
    activeTokens.delete(token);
  },

  isValidSession: (token: string) => {
    return activeTokens.has(token);
  },

  clearAllSessions: () => {
    activeTokens.clear();
  }
};

// Request sanitization middleware
interface RequestLike {
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export const sanitizeRequest = (req: RequestLike) => {
  const sanitized = { ...req };
  
  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  sensitiveHeaders.forEach(header => {
    if (sanitized.headers?.[header]) {
      sanitized.headers[header] = '[REDACTED]';
    }
  });

  // Sanitize body
  if (sanitized.body && typeof sanitized.body === 'object') {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
      if (sanitized.body && typeof sanitized.body === 'object' && field in sanitized.body) {
        sanitized.body[field] = '[REDACTED]';
      }
    });
  }

  return sanitized;
};

// Error handling middleware
export const securityErrorHandler = (error: Error & { status?: number }) => {
  // Log security-related errors
  if (error.message.toLowerCase().includes('security') || 
      error.message.toLowerCase().includes('authentication') ||
      error.message.toLowerCase().includes('authorization')) {
    console.error('Security Error:', error);
  }

  return {
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message,
      status: error.status || 500
    }
  };
};
