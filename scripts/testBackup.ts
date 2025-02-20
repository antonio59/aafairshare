import { BackupService } from '../src/utils/backupUtils';
import { auditLog, AuditLogType } from '../src/utils/auditLogger';
import fs from 'fs';

async function main() {
  try {
    console.log('Starting backup integrity test...');

    // Read backup report
    const report = JSON.parse(fs.readFileSync('backup-report.json', 'utf8'));
    
    if (report.status !== 'success') {
      throw new Error('Cannot test backup: Backup creation failed');
    }

    // Test the backup
    const isValid = await BackupService.testBackup(report.metadata.timestamp);

    if (!isValid) {
      throw new Error('Backup integrity test failed');
    }

    console.log('Backup integrity test passed');
    
    await auditLog(
      AuditLogType.ADMIN_ACTION,
      'Backup integrity test completed',
      { status: 'success', timestamp: report.metadata.timestamp }
    );

    process.exit(0);
  } catch (error) {
    console.error('Backup test failed:', error);

    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'Backup integrity test failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    process.exit(1);
  }
}

main();
