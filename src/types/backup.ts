export type BackupType = 'daily' | 'weekly' | 'monthly';
export type BackupStatus = 'pending' | 'completed' | 'failed';

export interface BackupMetadata {
  id: string;
  timestamp: string;
  type: BackupType;
  tables: string[];
  size: number;
  status: BackupStatus;
  error?: string;
  restoredAt?: string;
  restoredBy?: string;
}

export interface BackupResult {
  metadata: BackupMetadata;
  success: boolean;
  error?: string;
}

export interface BackupOptions {
  encrypt?: boolean;
  compress?: boolean;
  includeAttachments?: boolean;
  excludeTables?: string[];
}

export interface RestoreOptions {
  skipExistingRecords?: boolean;
  validateChecksum?: boolean;
  dryRun?: boolean;
}

export interface BackupData {
  [table: string]: any[];
}

export const DEFAULT_BACKUP_OPTIONS: BackupOptions = {
  encrypt: true,
  compress: true,
  includeAttachments: true,
  excludeTables: []
};

export const DEFAULT_RESTORE_OPTIONS: RestoreOptions = {
  skipExistingRecords: false,
  validateChecksum: true,
  dryRun: false
};
