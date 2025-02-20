import { supabase } from '../supabase';
import { logDataOperation, createLogEntry } from './logging';

interface BackupMetadata {
  timestamp: string;
  tables: string[];
  userId: string;
}

export const backupData = async () => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  try {
    // Tables to backup
    const tables = ['categories', 'category_groups', 'tags', 'expenses', 'budgets', 'recurring_expenses'];
    const backupData: { [key: string]: any[] } = {};

    // Fetch data from each table
    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      backupData[tableName] = data;
    }

    // Create backup metadata
    const metadata: BackupMetadata = {
      timestamp: new Date().toISOString(),
      tables,
      userId: user.id
    };

    // Create backup object with data and metadata
    const backup = {
      metadata,
      data: backupData
    };

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `backups/${user.id}/${timestamp}.json`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('backups')
      .upload(backupPath, JSON.stringify(backup), {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Log successful backup
    await logDataOperation(createLogEntry(
      'backup_created',
      'backups',
      user.id,
      backupPath,
      { tables }
    ));

    return backupPath;
  } catch (error) {
    // Log backup failure
    await logDataOperation(createLogEntry(
      'backup_failed',
      'backups',
      user.id,
      undefined,
      undefined,
      error instanceof Error ? error.message : 'Unknown error during backup'
    ));
    throw error;
  }
};

// Schedule daily backups
export const initializeBackupSchedule = () => {
  // Check if we already have a backup from today
  const checkAndCreateBackup = async () => {
    try {
      await backupData();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  };

  // Run backup immediately
  checkAndCreateBackup();

  // Schedule daily backups at 00:00
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  // Schedule first backup
  setTimeout(() => {
    checkAndCreateBackup();
    // Then schedule recurring backups every 24 hours
    setInterval(checkAndCreateBackup, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
};
