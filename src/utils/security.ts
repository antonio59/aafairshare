import DOMPurify from 'dompurify';

interface SanitizeConfig {
  allowedTags?: string[];
  allowedAttrs?: string[];
  allowDataAttrs?: boolean;
  sanitizeDom?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

interface EmailValidationConfig {
  maxLength?: number;
  allowedDomains?: string[];
}

interface PasswordValidationConfig {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecial?: boolean;
}

interface TextValidationConfig {
  maxLength?: number;
  allowHtml?: boolean;
  allowUrls?: boolean;
}

// Enhanced input sanitization with strict configuration
export function createSanitizeConfig(config?: Partial<SanitizeConfig>): DOMPurify.Config {
  return {
    ALLOWED_TAGS: config?.allowedTags || [],
    ALLOWED_ATTR: config?.allowedAttrs || [],
    ALLOW_DATA_ATTR: config?.allowDataAttrs || false,
    USE_PROFILES: { html: false },
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,

    SANITIZE_DOM: config?.sanitizeDom ?? true,
    WHOLE_DOCUMENT: false,
    SANITIZE_NAMED_PROPS: true,
    ADD_TAGS: ['#text'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'class', 'id', 'href', 'src', 'on*']
  };
}

export function sanitizeInput(input: string, _config?: Partial<SanitizeConfig>): string {
  if (typeof input !== 'string') return '';
  
  // First pass: Basic character encoding
  const preEncoded = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Second pass: DOMPurify with strict configuration
  return DOMPurify.sanitize(preEncoded, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: false },
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,

    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    SANITIZE_NAMED_PROPS: true,
    ADD_TAGS: ['#text'], // Only allow text nodes
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'class', 'id', 'href', 'src', 'on*']
  });
}

// Validate numeric input with configurable range
export const validateAmount = (amount: string, min: number = 0, max: number = 1000000): ValidationResult => {
  const num = parseFloat(amount);
  if (isNaN(num)) return { isValid: false, errors: ['Invalid number format'] };
  if (num < min || num > max) return { isValid: false, errors: [`Amount must be between ${min} and ${max}`] };
  // Ensure no more than 2 decimal places
  if (amount.includes('.') && amount.split('.')[1].length > 2) return { isValid: false, errors: ['Maximum 2 decimal places allowed'] };
  return { isValid: true };
};

// Enhanced date validation
export const validateDate = (date: string): ValidationResult => {
  const d = new Date(date);
  if (!(d instanceof Date) || isNaN(d.getTime())) return { isValid: false, errors: ['Invalid date format'] };
  
  // Ensure date is not in the future
  const now = new Date();
  if (d > now) return { isValid: false, errors: ['Date cannot be in the future'] };
  
  // Ensure date is not too far in the past (e.g., not before 2020)
  const minDate = new Date('2020-01-01');
  if (d < minDate) return { isValid: false, errors: ['Date cannot be before 2020'] };
  
  return { isValid: true };
};

// Enhanced email validation
export function validateEmail(email: string, _config: EmailValidationConfig = {}): ValidationResult {
  if (typeof email !== 'string') return { isValid: false, errors: ['Email must be a string'] };
  
  // Simpler, more maintainable email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return { isValid: false, errors: ['Invalid email format'] };
  if (email.length > 254) return { isValid: false, errors: ['Email exceeds maximum length'] }; // RFC 5321
  
  // Get allowed domains from environment
  const allowedDomains = process.env.VITE_ALLOWED_EMAIL_DOMAINS?.split(',') || [];
  const emailDomain = email.split('@')[1]?.toLowerCase();
  
  return allowedDomains.includes(emailDomain) 
    ? { isValid: true }
    : { isValid: false, errors: ['Email domain not allowed'] };
}

// Enhanced password validation
export function validatePassword(password: string, _config: PasswordValidationConfig = {}): ValidationResult {
  const errors: string[] = [];
  
  // Minimum 8 characters, max 100 characters
  if (password.length < 8 || password.length > 100) {
    errors.push('Password must be between 8 and 100 characters');
  }
  
  // Must contain at least:
  // - one uppercase letter
  // - one lowercase letter
  // - one number
  // - one special character
  if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Must contain number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Must contain special character');
  
  return errors.length === 0 
    ? { isValid: true }
    : { isValid: false, errors };
}

// Validate text input length and content with enhanced security
export function validateText(text: string, _config: TextValidationConfig = {}): ValidationResult {
  const errors: string[] = [];
  const { maxLength = 1000 } = config || {};

  if (typeof text !== 'string') errors.push('Input must be a string');
  if (!text || text.trim().length === 0) errors.push('Input cannot be empty');
  if (text.length > maxLength) errors.push(`Input exceeds maximum length of ${maxLength}`);

  // Comprehensive XSS and injection patterns
  const dangerousPatterns = [
    // Script tags and events
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*>/gi,
    /on\w+\s*=\s*["']?[^"']*["']?/gi,
    
    // Dangerous protocols
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /file:/gi,
    
    // Dangerous tags
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<frame[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<form[^>]*>[\s\S]*?<\/form>/gi,
    
    // Other dangerous patterns
    /expression\s*\([^)]*\)/gi,
    /url\s*\([^)]*\)/gi,
    /eval\s*\([^)]*\)/gi,
    /settimeout\s*\([^)]*\)/gi,
    /setinterval\s*\([^)]*\)/gi,
    /function\s*\([^)]*\)/gi,
    /new\s+function/gi
  ];

  const hasDangerousPattern = dangerousPatterns.find(pattern => pattern.test(text));
  if (hasDangerousPattern) errors.push('Input contains potentially dangerous content');

  return errors.length === 0
    ? { isValid: true }
    : { isValid: false, errors };
}

/**
 * Generate Content Security Policy header value
 * 
 * CSP Directives Configuration:
 * 
 * 1. Core Security Directives:
 * - default-src 'self': Restricts all fetching to same origin by default
 * - script-src: Allows necessary JavaScript sources including Supabase and Analytics
 * - style-src: Allows styles from same origin and Google Fonts
 * - font-src: Allows fonts from same origin and Google Fonts
 * - img-src: Allows images from same origin, data URIs, and Analytics
 * 
 * 2. Connection and Resource Directives:
 * - connect-src: Allows connections to Supabase, Analytics, and GitHub.dev services
 * - frame-src: Allows frames from Supabase services
 * - manifest-src: Allows manifest files from GitHub.dev integration
 * - worker-src: Restricts workers to same origin
 * 
 * 3. Security Enhancement Directives:
 * - object-src 'none': Prevents object/embed/applet injection attacks
 * - base-uri: Restricts base tag to same origin
 * - form-action: Restricts form submissions to same origin
 * - frame-ancestors: Prevents site from being embedded in frames
 * 
 * 4. Protocol and Mixed Content:
 * - upgrade-insecure-requests: Forces HTTPS
 * - block-all-mixed-content: Prevents mixed content
 * 
 * 5. GitHub.dev Integration:
 * - Specific allowances for GitHub.dev domain to support authentication
 * - Manifest loading from GitHub.dev services
 * - WebSocket connections for real-time features
 */
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.github.dev https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev",
    "frame-src 'self' https://*.supabase.co",
    "manifest-src 'self' https://*.github.dev https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');
};
