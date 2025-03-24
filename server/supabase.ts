import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Log the environment variables presence (not the actual values for security)
console.log('Environment variable check:');
console.log('process.env.SUPABASE_URL exists:', !!supabaseUrl);
console.log('process.env.SUPABASE_KEY exists:', !!supabaseKey);
console.log('process.env.SUPABASE_SERVICE_KEY exists:', !!supabaseServiceKey);
console.log('URL starts with:', supabaseUrl?.substring(0, 8));
console.log('Key starts with:', supabaseKey?.substring(0, 8));
console.log('Service Key starts with:', supabaseServiceKey?.substring(0, 8));

// Initialize Supabase client
let supabase: ReturnType<typeof createClient>;

if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
  log('Missing Supabase credentials. Using in-memory storage instead.');
  // Create a dummy client that will not be used but allows imports to work
  supabase = createClient('https://placeholder.supabase.co', 'placeholder_key');
} else {
  // Prefer service key for admin operations if available
  const apiKey = supabaseServiceKey || supabaseKey;
  
  log('Initializing Supabase client with provided credentials.');
  console.log(`Using Supabase URL pattern: ${supabaseUrl?.substring(0, 8)}...`);
  
  if (supabaseServiceKey) {
    log('Using service role key for database operations (admin privileges)');
  } else {
    log('Using regular API key for database operations (limited privileges)');
  }
  
  // Create the Supabase client with proper options and request debugging
  supabase = createClient(supabaseUrl, apiKey as string, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    // Log responses for debugging
    global: { 
      fetch: (...args) => {
        // Log the request
        const url = args[0] as string;
        console.log(`Supabase API request to: ${url}`);
        
        // Make the fetch request
        return fetch(...args).then((response) => {
          // Create a clone of the response to read the body
          const clone = response.clone();
          
          // Only log full response for non-OK responses to avoid clutter
          if (!response.ok) {
            clone.text().then(body => {
              try {
                console.log(`Supabase API error response: ${response.status}`, JSON.parse(body));
              } catch (e) {
                console.log(`Supabase API error response: ${response.status}`, body);
              }
            }).catch(err => {
              console.log(`Error reading response body: ${err}`);
            });
          } else {
            console.log(`Supabase API success: ${response.status} ${response.statusText}`);
          }
          
          return response;
        });
      }
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