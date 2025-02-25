export interface BackupMetadata {
  timestamp: string;
  version: string;
  tables: string[];
  size: number;
  checksum: string;
}

export interface BackupResult {
  success: boolean;
  metadata?: BackupMetadata;
  error?: string;
}

export interface BackupOptions {
  encryptData?: boolean;
  compressionLevel?: number;
  retentionDays?: number;
}

export interface RestoreOptions {
  validateChecksum?: boolean;
  skipAuditLogs?: boolean;
  dryRun?: boolean;
}

export interface BackupData {
  [table: string]: Record<string, unknown>[];
}

export const DEFAULT_BACKUP_OPTIONS: BackupOptions = {
  encryptData: true,
  compressionLevel: 9,
  retentionDays: 30
};

export const DEFAULT_RESTORE_OPTIONS: RestoreOptions = {
  validateChecksum: true,
  skipAuditLogs: false,
  dryRun: false
};
