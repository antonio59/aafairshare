import { supabase } from './lib/supabase';
import { _Session } from '@supabase/supabase-js';

interface TestResult {
  hasData: boolean;
  dataCount?: number;
  hasError: boolean;
  errorMessage?: string;
}

interface AuthTestResult extends TestResult {
  hasSession: boolean;
}

// Test Supabase connection
console.log('Testing Supabase connection...');

async function testConnection(): Promise<void> {
  try {
    // Test auth
    console.log('Testing auth...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    const authResult: AuthTestResult = { 
      hasSession: !!authData?.session,
      hasData: !!authData,
      hasError: !!authError,
      errorMessage: authError?.message
    };
    console.log('Auth test result:', authResult);

    // Test database query
    console.log('Testing database query...');
    const { data: dbData, error: dbError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    const dbResult: TestResult = { 
      hasData: !!dbData,
      dataCount: dbData?.length,
      hasError: !!dbError,
      errorMessage: dbError?.message
    };
    console.log('Database test result:', dbResult);

    // Test storage
    console.log('Testing storage...');
    const { data: storageData, error: storageError } = await supabase
      .storage
      .listBuckets();
    const storageResult: TestResult = { 
      hasData: !!storageData,
      dataCount: storageData?.length,
      hasError: !!storageError,
      errorMessage: storageError?.message
    };
    console.log('Storage test result:', storageResult);

    console.log('All tests completed');
  } catch (error) {
    console.error('Error during tests:', error instanceof Error ? error.message : String(error));
  }
}

testConnection();

export default testConnection; 