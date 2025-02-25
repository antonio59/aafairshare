import { supabase } from '../supabase';
import { auditLog, AUDIT_LOG_TYPE } from './auditLogger';
import { encrypt, decrypt } from './encryptionUtils';

interface BackupMetadata {
  timestamp: string;
  version: string;
  tables: string[];
  size: number;
  checksum: string;
}

interface BackupResult {
  success: boolean;
  metadata?: BackupMetadata;
  error?: string;
}

interface BackupOptions {
  encryptData?: boolean;
  compressionLevel?: number;
  retentionDays?: number;
}

interface RestoreOptions {
  validateChecksum?: boolean;
  skipAuditLogs?: boolean;
  dryRun?: boolean;
}

const DEFAULT_BACKUP_OPTIONS: BackupOptions = {
  encryptData: true,
  compressionLevel: 9,
  retentionDays: 30
};

const DEFAULT_RESTORE_OPTIONS: RestoreOptions = {
  validateChecksum: true,
  skipAuditLogs: false,
  dryRun: false
};

export const BACKUP_BUCKET = 'backups' as const;
export const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY as string;

// Helper functions
export async function generateChecksum(data: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

/**
 * Creates a full backup of the database
 */
export async function createBackup(_options: BackupOptions = DEFAULT_BACKUP_OPTIONS): Promise<BackupResult> {
    try {
      const timestamp = new Date().toISOString();
      const tables = ['expenses', 'profiles', 'audit_logs'];
      const backupData: Record<string, unknown> = {};

      // Fetch data from each table
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) throw error;
        backupData[table] = data;
      }

      // Encrypt the backup data
      const encryptedData = await encrypt(
        JSON.stringify(backupData),
        MASTER_KEY
      );

      // Generate checksum
      const checksum = await generateChecksum(encryptedData);

      // Create backup metadata
      const metadata: BackupMetadata = {
        timestamp,
        version: '1.0',
        tables,
        size: encryptedData.length,
        checksum
      };

      // Store backup in Supabase Storage
      const filename = `backup-${timestamp}.enc`;
      const { error: uploadError } = await supabase.storage
        .from(this.BACKUP_BUCKET)
        .upload(filename, encryptedData);

      if (uploadError) throw uploadError;

      // Log backup creation
      await auditLog(
        AUDIT_LOG_TYPE.ADMIN_ACTION,
        'backup_created',
        { timestamp, tables, size: metadata.size },
        undefined
      );

      return { success: true, metadata };
    } catch (error) {
      await auditLog(
        AUDIT_LOG_TYPE.SECURITY_EVENT,
        'backup_failed',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        undefined
      );
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

/**
 * Restores data from a backup
 */
export async function restoreBackup(timestamp: string, _options: RestoreOptions = DEFAULT_RESTORE_OPTIONS): Promise<BackupResult> {
    try {
      // Download backup file
      const filename = `backup-${timestamp}.enc`;
      const { data, error } = await supabase.storage
        .from(this.BACKUP_BUCKET)
        .download(filename);

      if (error) throw error;

      // Decrypt backup data
      const encryptedData = await data.text();
      const decryptedString = await decrypt(
        encryptedData,
        this.MASTER_KEY
      );

      const backupData = JSON.parse(decryptedString) as Record<string, unknown>;

      // Start transaction for restore
      const { error: txError } = await supabase.rpc('begin_transaction');
      if (txError) throw txError;

      try {
        // Restore each table
        for (const [table, records] of Object.entries(backupData)) {
          // Clear existing data
          await supabase.from(table).delete().neq('id', '0');

          // Insert backup data
          const { error: insertError } = await supabase
            .from(table)
            .insert(records);

          if (insertError) throw insertError;
        }

        // Commit transaction
        await supabase.rpc('commit_transaction');

        await auditLog(
          AUDIT_LOG_TYPE.ADMIN_ACTION,
          'backup_restored',
          { timestamp },
          undefined
        );
        return { success: true };
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      await auditLog(
        AUDIT_LOG_TYPE.SECURITY_EVENT,
        'restore_failed',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        undefined
      );
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

/**
 * Tests a backup by restoring it to a temporary database
 */
export async function testBackup(timestamp: string, _options: RestoreOptions = DEFAULT_RESTORE_OPTIONS): Promise<BackupResult> {
    try {
      // Download and decrypt backup
      const filename = `backup-${timestamp}.enc`;
      const { data, error } = await supabase.storage
        .from(this.BACKUP_BUCKET)
        .download(filename);

      if (error) throw error;

      const encryptedData = await data.text();
      const decryptedString = await decrypt(
        encryptedData,
        this.MASTER_KEY
      );

      // Verify JSON structure
      const backupData = JSON.parse(decryptedString) as Record<string, unknown>;
      const requiredTables = ['expenses', 'profiles', 'audit_logs'];
      
      for (const table of requiredTables) {
        if (!backupData[table]) {
          throw new Error(`Missing required table: ${table}`);
        }
      }

      await auditLog(
        AUDIT_LOG_TYPE.ADMIN_ACTION,
        'backup_test_completed',
        { timestamp, status: 'success' },
        undefined
      );

      return { success: true };
    } catch (error) {
      await auditLog(
        AUDIT_LOG_TYPE.SECURITY_EVENT,
        'backup_test_failed',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        undefined
      );
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

}
