import { createClient } from '@supabase/supabase-js';
import { createLogger } from './core/utils/logger';
import { config } from 'dotenv';
import { resolve } from 'path';

const logger = createLogger('TestKey');

// Load environment variables from .env files
function loadEnv() {
  const envFiles = ['.env', '.env.local', '.env.development'];
  for (const file of envFiles) {
    const envPath = resolve(process.cwd(), file);
    config({ path: envPath });
  }
}

loadEnv();

// Get the key from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

logger.info('Testing configuration:', {
  hasUrl: !!supabaseUrl,
  keyLength: supabaseKey?.length || 0,
  url: supabaseUrl
});

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKey() {
  try {
    // Try a simple query that doesn't require auth
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (error) {
      logger.error('API Key test failed:', error);
      return false;
    }

    logger.info('API Key is valid');
    return true;
  } catch (error) {
    logger.error('Error testing API key:', error);
    return false;
  }
}

// Run the test
testKey()
  .then(isValid => {
    logger.info('Key test completed:', { isValid });
    process.exit(isValid ? 0 : 1);
  })
  .catch(error => {
    logger.error('Test failed:', error);
    process.exit(1);
  }); 