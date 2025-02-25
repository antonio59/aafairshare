import { supabase } from '../supabase';
import { auditLog, AUDIT_LOG_TYPE } from '../utils/auditLogger';

async function testAuditLogging() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user logged in. Please log in first.');
      return;
    }

    console.log('Creating test audit log entries...');

    // Test 1: Log a security event
    await auditLog(
      AUDIT_LOG_TYPE.SECURITY_EVENT,
      'Test security event',
      { test: true, message: 'This is a test security event' }
    );
    console.log('✓ Created security event log');

    // Test 2: Log a data modification
    await auditLog(
      AUDIT_LOG_TYPE.DATA_UPDATE,
      'Test data update',
      { 
        entityType: 'expense',
        testId: '123',
        changes: { amount: { from: 100, to: 200 } }
      }
    );
    console.log('✓ Created data update log');

    // Test 3: Log an admin action
    await auditLog(
      AUDIT_LOG_TYPE.ADMIN_ACTION,
      'Test admin action',
      { action: 'system_config_change', parameter: 'timeout_duration' }
    );
    console.log('✓ Created admin action log');

    // Verify logs were created
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(3);

    if (error) {
      throw error;
    }

    console.log('\nRecent audit logs:', logs);
    
  } catch (error) {
    console.error('Error testing audit logs:', error);
  }
}

// Run the test
testAuditLogging();
