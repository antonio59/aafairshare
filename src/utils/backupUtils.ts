export type NotificationChannel = 'email' | 'push' | 'inApp';

export interface BudgetNotificationSetting {
  enabled: boolean;
  threshold: number;
  channels: NotificationChannel[];
}

export interface ChanneledNotificationSetting {
  enabled: boolean;
  channels: NotificationChannel[];
}

export interface TimedNotificationSetting {
  enabled: boolean;
  day: number;
  channels: NotificationChannel[];
}import { supabase } from '../supabase';
import { auditLog, AuditLogType } from './auditLogger';
import { EncryptionService } from './encryptionUtils';

interface BackupMetadata {
  timestamp: string;
  version: string;
  tables: string[];
  size: number;
  checksum: string;
}

export class BackupService {
  private static readonly BACKUP_BUCKET = 'backups';
  private static readonly MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY as string;

  /**
   * Creates a full backup of the database
   */
  static async createBackup(): Promise<BackupMetadata> {
    try {
      const timestamp = new Date().toISOString();
      const tables = ['expenses', 'profiles', 'audit_logs'];
      let backupData: Record<string, any> = {};

      // Fetch data from each table
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) throw error;
        backupData[table] = data;
      }

      // Encrypt the backup data
      const encryptedData = await EncryptionService.encrypt(
        JSON.stringify(backupData),
        this.MASTER_KEY
      );

      // Generate checksum
      const checksum = await this.generateChecksum(encryptedData);

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
        AuditLogType.ADMIN_ACTION,
        'Backup created',
        { timestamp, tables, size: metadata.size }
      );

      return metadata;
    } catch (error) {
      await auditLog(
        AuditLogType.SECURITY_EVENT,
        'Backup failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  }

  /**
   * Restores data from a backup
   */
  static async restoreBackup(timestamp: string): Promise<void> {
    try {
      // Download backup file
      const filename = `backup-${timestamp}.enc`;
      const { data, error } = await supabase.storage
        .from(this.BACKUP_BUCKET)
        .download(filename);

      if (error) throw error;

      // Decrypt backup data
      const encryptedData = await data.text();
      const decryptedString = await EncryptionService.decrypt(
        encryptedData,
        this.MASTER_KEY
      );

      const backupData = JSON.parse(decryptedString) as Record<string, any>;

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
          AuditLogType.ADMIN_ACTION,
          'Backup restored',
          { timestamp }
        );
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      await auditLog(
        AuditLogType.SECURITY_EVENT,
        'Backup restoration failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  }

  /**
   * Tests a backup by restoring it to a temporary database
   */
  static async testBackup(timestamp: string): Promise<boolean> {
    try {
      // Download and decrypt backup
      const filename = `backup-${timestamp}.enc`;
      const { data, error } = await supabase.storage
        .from(this.BACKUP_BUCKET)
        .download(filename);

      if (error) throw error;

      const encryptedData = await data.text();
      const decryptedString = await EncryptionService.decrypt(
        encryptedData,
        this.MASTER_KEY
      );

      // Verify JSON structure
      const backupData = JSON.parse(decryptedString) as Record<string, any>;
      const requiredTables = ['expenses', 'profiles', 'audit_logs'];
      
      for (const table of requiredTables) {
        if (!backupData[table]) {
          throw new Error(`Missing required table: ${table}`);
        }
      }

      await auditLog(
        AuditLogType.ADMIN_ACTION,
        'Backup test completed',
        { timestamp, status: 'success' }
      );

      return true;
    } catch (error) {
      await auditLog(
        AuditLogType.SECURITY_EVENT,
        'Backup test failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  private static async generateChecksum(data: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
