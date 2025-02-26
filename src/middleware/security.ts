import { getSecurityHeaders } from '../utils/securityUtils';

// Apply security headers to all responses
export const applySecurityHeaders = () => {
  return {
    headers: {
      ...getSecurityHeaders(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  }
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // In production, check against the allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// Session management middleware
let activeTokens = new Set<string>();
const MAX_SESSIONS = 3;

export const sessionManager = {
  addSession: (token: string) => {
    if (activeTokens.size >= MAX_SESSIONS) {
      // Remove the oldest token if we've reached the limit
      const oldestToken = Array.from(activeTokens).shift();
      if (oldestToken) {
        activeTokens.delete(oldestToken);
      }
    }
    activeTokens.add(token);
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
export const sanitizeRequest = (req: any) => {
  const sanitized = { ...req };
  
  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  sensitiveHeaders.forEach(header => {
    if (sanitized.headers?.[header]) {
      sanitized.headers[header] = '[REDACTED]';
    }
  });

  // Sanitize body
  if (sanitized.body) {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
      if (sanitized.body[field]) {
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
