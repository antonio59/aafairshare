import { BackupService } from '../src/utils/backupUtils';
import { auditLog, AuditLogType } from '../src/utils/auditLogger';
import fs from 'fs';

async function main() {
  try {
    console.log('Starting backup process...');

    // Create backup
    const metadata = await BackupService.createBackup();

    // Save backup report
    const report = {
      status: 'success',
      timestamp: new Date().toISOString(),
      metadata,
      error: null
    };

    fs.writeFileSync('backup-report.json', JSON.stringify(report, null, 2));

    console.log('Backup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);

    // Log the failure
    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'Scheduled backup failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    // Save error report
    const report = {
      status: 'failed',
      timestamp: new Date().toISOString(),
      metadata: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    fs.writeFileSync('backup-report.json', JSON.stringify(report, null, 2));

    process.exit(1);
  }
}

main();
