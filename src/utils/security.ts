import DOMPurify from 'dompurify';

// Enhanced input sanitization with strict configuration
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    ALLOW_DATA_ATTR: false, // Prevent data attributes
    USE_PROFILES: { html: false }, // Disable HTML profile
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true
  });
};

// Validate numeric input with configurable range
export const validateAmount = (amount: string, min: number = 0, max: number = 1000000): boolean => {
  const num = parseFloat(amount);
  if (isNaN(num)) return false;
  if (num < min || num > max) return false;
  // Ensure no more than 2 decimal places
  if (amount.includes('.') && amount.split('.')[1].length > 2) return false;
  return true;
};

// Enhanced date validation
export const validateDate = (date: string): boolean => {
  const d = new Date(date);
  if (!(d instanceof Date) || isNaN(d.getTime())) return false;
  
  // Ensure date is not in the future
  const now = new Date();
  if (d > now) return false;
  
  // Ensure date is not too far in the past (e.g., not before 2020)
  const minDate = new Date('2020-01-01');
  if (d < minDate) return false;
  
  return true;
};

// Enhanced email validation
export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) return false;
  
  // Check specific allowed domains
  const allowedEmails = ['andypamo@gmail.com', 'antoniojsmith@protonmail.com'];
  return allowedEmails.includes(email.toLowerCase());
};

// Enhanced password validation
export const validatePassword = (password: string): boolean => {
  // Minimum 8 characters, max 100 characters
  if (password.length < 8 || password.length > 100) return false;
  
  // Must contain at least:
  // - one uppercase letter
  // - one lowercase letter
  // - one number
  // - one special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Validate text input length and content
export const validateText = (text: string, maxLength: number = 500): boolean => {
  if (!text || text.trim().length === 0) return false;
  if (text.length > maxLength) return false;
  // Prevent common XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi
  ];
  return !xssPatterns.some(pattern => pattern.test(text));
};

// Generate Content Security Policy header value
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' https://apis.google.com https://*.firebaseapp.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.firebaseio.com https://*.cloudfunctions.net",
    "frame-src 'self' https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};
