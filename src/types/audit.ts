export type AuditActionType = 
  | 'user_login'
  | 'user_logout'
  | 'data_access'
  | 'data_modification'
  | 'settings_change'
  | 'security_event'
  | 'backup_operation'
  | 'export_operation';

export type AuditLogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogMetadata {
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditLogDetails {
  action: AuditActionType;
  level: AuditLogLevel;
  resource: string;
  description: string;
  changes?: {
    before?: Record<string, string | number | boolean>;
    after?: Record<string, string | number | boolean>;
  };
  metadata: AuditLogMetadata;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: AuditActionType;
  details: AuditLogDetails;
  success: boolean;
  errorMessage?: string;
}
