import { supabase } from '../supabase';
import { auditLog, AUDIT_LOG_TYPE } from './auditLogger';
import { encrypt, decrypt } from './encryptionUtils';
import {
  DEFAULT_BACKUP_OPTIONS,
  DEFAULT_RESTORE_OPTIONS
} from '../types/backup';
import type {
  BackupMetadata,
  BackupResult,
  BackupOptions,
  RestoreOptions,
  BackupData
} from '../types/backup';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

export const BACKUP_BUCKET = 'backups' as const;
export const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY as string;

// Configuration for backup storage
const BACKUP_CONFIG = {
  frequency: {
    daily: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    weekly: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    monthly: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  },
  retention: {
    daily: 7, // Keep 7 daily backups
    weekly: 4, // Keep 4 weekly backups
    monthly: 12, // Keep 12 monthly backups
  },
  tables: [
    'users',
    'profiles',
    'transactions',
    'accounts',
    'audit_logs',
    'security_alerts',
    // Add other tables as needed
  ],
};

// Helper functions
export async function generateChecksum(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a backup of the specified tables
 * @param type The type of backup (daily, weekly, monthly)
 * @param userId The ID of the user initiating the backup
 */
export async function createBackup(
  type: 'daily' | 'weekly' | 'monthly',
  userId: string
): Promise<BackupMetadata | null> {
  try {
    const timestamp = new Date().toISOString();
    const backupId = `backup_${type}_${format(new Date(), 'yyyyMMdd_HHmmss')}`;
    
    // Create backup metadata
    const backupMetadata: BackupMetadata = {
      id: backupId,
      timestamp,
      type,
      tables: BACKUP_CONFIG.tables,
      size: 0,
      status: 'pending',
    };
    
    // Log the backup initiation
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      `Initiated ${type} backup`,
      { backupId, tables: BACKUP_CONFIG.tables },
      userId
    );
    
    // Store backup metadata
    const { error: metadataError } = await supabase
      .from('backup_metadata')
      .insert(backupMetadata);
    
    if (metadataError) {
      throw new Error(`Failed to store backup metadata: ${metadataError.message}`);
    }
    
    // Perform the actual backup
    const backupData: Record<string, any[]> = {};
    let totalSize = 0;
    
    // Backup each table
    for (const table of BACKUP_CONFIG.tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        throw new Error(`Failed to backup table ${table}: ${error.message}`);
      }
      
      backupData[table] = data || [];
      totalSize += JSON.stringify(data).length;
    }
    
    // Store the backup data
    const { error: storageError } = await supabase
      .storage
      .from('backups')
      .upload(`${backupId}.json`, JSON.stringify(backupData));
    
    if (storageError) {
      throw new Error(`Failed to store backup data: ${storageError.message}`);
    }
    
    // Update backup metadata with size and status
    const { error: updateError } = await supabase
      .from('backup_metadata')
      .update({
        size: totalSize,
        status: 'completed',
      })
      .eq('id', backupId);
    
    if (updateError) {
      throw new Error(`Failed to update backup metadata: ${updateError.message}`);
    }
    
    // Log successful backup
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      `Completed ${type} backup`,
      { backupId, size: totalSize },
      userId
    );
    
    // Clean up old backups
    await cleanupOldBackups(type);
    
    return {
      ...backupMetadata,
      size: totalSize,
      status: 'completed',
    };
  } catch (error) {
    console.error('Backup failed:', error);
    
    // Log backup failure
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      'Backup failed',
      { error: error instanceof Error ? error.message : String(error) },
      userId
    );
    
    return null;
  }
}

/**
 * Restores data from a backup
 * @param backupId The ID of the backup to restore
 * @param userId The ID of the user initiating the restore
 */
export async function restoreBackup(
  backupId: string,
  userId: string
): Promise<boolean> {
  try {
    // Log restore initiation
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      'Initiated backup restore',
      { backupId },
      userId
    );
    
    // Get backup metadata
    const { data: metadataData, error: metadataError } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', backupId)
      .single();
    
    if (metadataError || !metadataData) {
      throw new Error(`Failed to get backup metadata: ${metadataError?.message || 'Backup not found'}`);
    }
    
    // Get backup data
    const { data: backupData, error: storageError } = await supabase
      .storage
      .from('backups')
      .download(`${backupId}.json`);
    
    if (storageError || !backupData) {
      throw new Error(`Failed to get backup data: ${storageError?.message || 'Backup data not found'}`);
    }
    
    // Parse backup data
    const backupContent = JSON.parse(await backupData.text()) as Record<string, any[]>;
    
    // Restore each table
    for (const table of metadataData.tables) {
      if (!backupContent[table]) {
        console.warn(`Table ${table} not found in backup`);
        continue;
      }
      
      // Clear existing data
      const { error: clearError } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Safety check to avoid deleting everything
      
      if (clearError) {
        throw new Error(`Failed to clear table ${table}: ${clearError.message}`);
      }
      
      // Insert backup data
      const { error: insertError } = await supabase
        .from(table)
        .insert(backupContent[table]);
      
      if (insertError) {
        throw new Error(`Failed to restore data to table ${table}: ${insertError.message}`);
      }
    }
    
    // Update backup metadata
    const { error: updateError } = await supabase
      .from('backup_metadata')
      .update({
        restoredAt: new Date().toISOString(),
        restoredBy: userId,
      })
      .eq('id', backupId);
    
    if (updateError) {
      throw new Error(`Failed to update backup metadata: ${updateError.message}`);
    }
    
    // Log successful restore
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      'Completed backup restore',
      { backupId },
      userId
    );
    
    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    
    // Log restore failure
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      'Backup restore failed',
      { error: error instanceof Error ? error.message : String(error) },
      userId
    );
    
    return false;
  }
}

/**
 * Cleans up old backups based on retention policy
 * @param type The type of backup to clean up
 */
async function cleanupOldBackups(type: 'daily' | 'weekly' | 'monthly'): Promise<void> {
  try {
    // Get all backups of the specified type
    const { data: backups, error } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('type', type)
      .eq('status', 'completed')
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get backups: ${error.message}`);
    }
    
    if (!backups || backups.length <= BACKUP_CONFIG.retention[type]) {
      // No cleanup needed
      return;
    }
    
    // Get backups to delete
    const backupsToDelete = backups.slice(BACKUP_CONFIG.retention[type]);
    
    // Delete each backup
    for (const backup of backupsToDelete) {
      // Delete backup data
      const { error: storageError } = await supabase
        .storage
        .from('backups')
        .remove([`${backup.id}.json`]);
      
      if (storageError) {
        console.error(`Failed to delete backup data: ${storageError.message}`);
      }
      
      // Delete backup metadata
      const { error: metadataError } = await supabase
        .from('backup_metadata')
        .delete()
        .eq('id', backup.id);
      
      if (metadataError) {
        console.error(`Failed to delete backup metadata: ${metadataError.message}`);
      }
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

/**
 * Schedules automatic backups
 */
export function scheduleBackups(): void {
  // Schedule daily backups
  setInterval(() => {
    createBackup('daily', 'system');
  }, BACKUP_CONFIG.frequency.daily);
  
  // Schedule weekly backups
  setInterval(() => {
    createBackup('weekly', 'system');
  }, BACKUP_CONFIG.frequency.weekly);
  
  // Schedule monthly backups
  setInterval(() => {
    createBackup('monthly', 'system');
  }, BACKUP_CONFIG.frequency.monthly);
}
