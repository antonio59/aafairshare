// Rate limiting configuration
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
  blockExpires?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const defaultRateLimitConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour
};

export const checkRateLimit = (
  identifier: string,
  config: RateLimitConfig = defaultRateLimitConfig
): { allowed: boolean; waitMs?: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier) || {
    attempts: 0,
    firstAttempt: now,
    blocked: false
  };

  // Check if currently blocked
  if (entry.blocked && entry.blockExpires && entry.blockExpires > now) {
    return { allowed: false, waitMs: entry.blockExpires - now };
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > config.windowMs) {
    entry.attempts = 0;
    entry.firstAttempt = now;
    entry.blocked = false;
  }

  // Increment attempts
  entry.attempts++;

  // Block if max attempts exceeded
  if (entry.attempts > config.maxAttempts) {
    entry.blocked = true;
    entry.blockExpires = now + config.blockDurationMs;
    rateLimitStore.set(identifier, entry);
    return { allowed: false, waitMs: config.blockDurationMs };
  }

  rateLimitStore.set(identifier, entry);
  return { allowed: true };
};

// Session management
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let lastActivity: number = Date.now();
let sessionTimeoutId: NodeJS.Timeout | null = null;

export const updateLastActivity = () => {
  lastActivity = Date.now();
};

export const startSessionTimeout = (onTimeout: () => void) => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }

  sessionTimeoutId = setTimeout(() => {
    const now = Date.now();
    if (now - lastActivity >= SESSION_TIMEOUT_MS) {
      onTimeout();
    }
  }, SESSION_TIMEOUT_MS);
};

// Security headers
export const getSecurityHeaders = () => ({
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
  'Content-Security-Policy': getCSPHeader()
});

// Enhanced input validation
export const validateInput = {
  password: (password: string): boolean => {
    if (password.length < 12 || password.length > 128) return false;
    
    const requirements = [
      /[A-Z]/, // uppercase
      /[a-z]/, // lowercase
      /[0-9]/, // numbers
      /[^A-Za-z0-9]/ // special characters
    ];

    return requirements.every(regex => regex.test(password));
  },

  email: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  text: (text: string, options: { maxLength?: number; allowedChars?: RegExp } = {}): boolean => {
    const { maxLength = 500, allowedChars = /^[\w\s.,!?-]*$/ } = options;
    return (
      text.length <= maxLength &&
      allowedChars.test(text) &&
      !/<[^>]*>/.test(text) // No HTML tags
    );
  }
};

// File upload security
export interface FileValidationOptions {
  maxSizeBytes: number;
  allowedTypes: string[];
}

export const validateFile = (
  file: File,
  options: FileValidationOptions
): { valid: boolean; error?: string } => {
  if (file.size > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${options.maxSizeBytes / 1024 / 1024}MB`
    };
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !options.allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

// Get CSP Header
function getCSPHeader(): string {
  const nonce = Date.now().toString();
  
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://*.supabase.co`,
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://www.google-analytics.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com",
    "frame-src 'self' https://*.supabase.co",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');
}

// Environment variable validation
export const validateEnvVars = () => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'API_URL',
    'NODE_ENV'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
