import { createClient } from '@supabase/supabase-js';
import { createLogger } from './core/utils/logger';

const logger = createLogger('DirectTest');

// Use hardcoded credentials for testing
const supabaseUrl = 'https://ccwcbnfnvkmwubkuvzns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjd2NibmZudmttd3Via3V2em5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzI0MDcsImV4cCI6MjA1NjcwODQwN30.tgbRreo_VKimkIcs9FvV6Vy1nUaAmLwd8ptwHXmI8GI';

logger.info('Testing direct Supabase connection with CORS handling');

// Create a custom fetch with CORS mode
const customFetch = (input: RequestInfo | URL, options?: RequestInit) => {
  // Convert input to string if needed
  const url = typeof input === 'string' ? input : input.toString();
  
  // Log the request details
  console.log('Direct API Request:', {
    url,
    method: options?.method || 'GET',
    hasAuth: options?.headers && 'Authorization' in options.headers
  });

  // Add explicit CORS handling
  const fetchOptions = {
    ...options,
    mode: 'cors' as RequestMode,
    headers: {
      ...options?.headers,
      'apikey': supabaseKey,
      'Origin': window.location.origin,
      'Content-Type': 'application/json'
    }
  };

  return fetch(input, fetchOptions).then(response => {
    // Log response details
    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      url: response.url,
      cors: response.type
    });
    
    if (!response.ok) {
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText
      });
    }
    return response;
  });
};

// Create Supabase client with custom fetch
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: customFetch
  }
});

// Export function to test connection
export async function testDirectConnection() {
  try {
    // Test with a simple query
    console.log('Testing direct Supabase query...');
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Direct query error:', error);
      return false;
    }
    
    console.log('Direct query successful:', data);
    return true;
  } catch (err) {
    console.error('Exception in direct test:', err);
    return false;
  }
}

// Function to test authentication specifically
export async function testDirectAuth(email: string, password: string) {
  try {
    console.log('Testing direct authentication...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Direct auth error:', error);
      return { success: false, error };
    }
    
    console.log('Direct auth successful:', { 
      user: data.user?.email,
      hasSession: !!data.session
    });
    return { success: true, data };
  } catch (err) {
    console.error('Exception in direct auth test:', err);
    return { success: false, error: err };
  }
} 