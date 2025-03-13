import { createClient } from '@supabase/supabase-js';
import { createLogger } from './core/utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

const logger = createLogger('TestConnection');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a test client
const supabase = createClient(supabaseUrl, supabaseKey);

export async function testSupabaseConnection() {
  try {
    logger.info('Testing Supabase connection...');
    
    // Test basic connection with a simple query
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
      
    if (settingsError) {
      logger.error('Failed to query settings:', settingsError);
      return false;
    }
    
    logger.info('Successfully connected to Supabase');
    
    // Test auth state
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.error('Failed to get session:', sessionError);
      return false;
    }
    
    logger.info('Session state:', {
      hasSession: !!sessionData.session,
      user: sessionData.session?.user?.email
    });
    
    return true;
  } catch (error) {
    logger.error('Unexpected error testing connection:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    logger.info('Connection test completed:', { success });
  })
  .catch(error => {
    logger.error('Test failed:', error);
  }); 