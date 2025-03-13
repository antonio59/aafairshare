import { createClient } from '@supabase/supabase-js';
import { createLogger } from './core/utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

const logger = createLogger('TestAuth');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a test client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: undefined // Don't persist session in test
  }
});

async function testAuth() {
  try {
    logger.info('Testing authentication...');
    
    // Test sign in with invalid credentials
    logger.info('Testing sign in with invalid credentials...');
    const { data: invalidData, error: invalidError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    logger.info('Invalid credentials result:', {
      success: !invalidError,
      error: invalidError?.message
    });
    
    // Test sign in with valid credentials (if you have test credentials)
    logger.info('Testing sign in with valid credentials...');
    const { data: validData, error: validError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Replace with valid test credentials
      password: 'testpassword'
    });
    
    logger.info('Valid credentials result:', {
      success: !validError,
      error: validError?.message,
      hasSession: !!validData.session
    });
    
    return true;
  } catch (error) {
    logger.error('Unexpected error testing auth:', error);
    return false;
  }
}

// Run the test
testAuth()
  .then(success => {
    logger.info('Auth test completed:', { success });
  })
  .catch(error => {
    logger.error('Test failed:', error);
  }); 