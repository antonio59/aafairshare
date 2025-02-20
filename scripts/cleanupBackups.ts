import { supabase } from '../src/supabase';
import { auditLog, AuditLogType } from '../src/utils/auditLogger';

async function main() {
  try {
    console.log('Starting backup cleanup...');

    const retentionDays = parseInt(process.env.RETENTION_DAYS || '30');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // List all backups
    const { data: backups, error: listError } = await supabase.storage
      .from('backups')
      .list();

    if (listError) throw listError;

    // Find old backups
    const oldBackups = backups?.filter(backup => {
      const backupDate = new Date(backup.created_at);
      return backupDate < cutoffDate;
    }) || [];

    console.log(`Found ${oldBackups.length} backups to clean up`);

    // Delete old backups
    for (const backup of oldBackups) {
      const { error: deleteError } = await supabase.storage
        .from('backups')
        .remove([backup.name]);

      if (deleteError) {
        console.error(`Failed to delete backup ${backup.name}:`, deleteError);
        continue;
      }

      console.log(`Deleted backup: ${backup.name}`);
    }

    await auditLog(
      AuditLogType.ADMIN_ACTION,
      'Old backups cleaned up',
      { 
        deletedCount: oldBackups.length,
        retentionDays
      }
    );

    console.log('Backup cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Backup cleanup failed:', error);

    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'Backup cleanup failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    process.exit(1);
  }
}

main();
