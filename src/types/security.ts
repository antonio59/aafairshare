export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecurityAlertType = 
  | 'AUTH_FAILURE'
  | 'UNUSUAL_ACCESS'
  | 'SUSPICIOUS_IP_DETECTED'
  | 'MALICIOUS_INPUT_DETECTED';

export interface SecurityAlertMetadata {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  location?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: SecuritySeverity;
  type: SecurityAlertType;
  message: string;
  details: SecurityAlertDetails;
  metadata: SecurityAlertMetadata;
  [key: string]: unknown;
}

export interface SecurityAlertDetails {
  source: string;
  description: string;
  affectedResource?: string;
  additionalInfo: {
    userId?: string;
    ipAddress?: string;
    attemptCount?: number;
    pattern?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export type SanitizedPrimitive = string | number | boolean | null | undefined;

export interface SanitizedObject {
  [key: string]: SanitizedValue;
}

export type SanitizedArray = SanitizedValue[];

export type SanitizedValue = SanitizedPrimitive | SanitizedObject | SanitizedArray;
