import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Log the environment variables presence (not the actual values for security)
console.log('Environment variable check:');
console.log('process.env.SUPABASE_URL exists:', !!supabaseUrl);
console.log('process.env.SUPABASE_KEY exists:', !!supabaseKey);
console.log('URL starts with:', supabaseUrl?.substring(0, 8));
console.log('Key starts with:', supabaseKey?.substring(0, 8));

// Initialize Supabase client
let supabase: ReturnType<typeof createClient>;

if (!supabaseUrl || !supabaseKey) {
  log('Missing Supabase credentials. Using in-memory storage instead.');
  // Create a dummy client that will not be used but allows imports to work
  supabase = createClient('https://placeholder.supabase.co', 'placeholder_key');
} else {
  log('Initializing Supabase client with provided credentials.');
  console.log(`Using Supabase URL pattern: ${supabaseUrl?.substring(0, 8)}...`);
  
  // Create the Supabase client with proper options
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
  
  // Verify the connection by making a simple query
  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('_dummy_check').select('count').limit(1);
      if (error && error.code !== '42P01') { // Table not found is expected
        console.error('Error connecting to Supabase:', error);
      } else {
        log('Supabase client initialized successfully!');
      }
    } catch (err) {
      console.error('Exception while checking Supabase connection:', err);
    }
  };
  
  // Execute the connection check
  checkConnection();
}

export { supabase };