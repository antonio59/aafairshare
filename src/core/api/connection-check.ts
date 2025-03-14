import { supabase } from './supabase';

/**
 * Quickly tests if the Supabase connection is working
 * @returns Object with success status and error message if any
 */
export async function checkSupabaseConnection() {
  console.log('Running Supabase connection test...');
  
  try {
    // First, log the Supabase client configuration
    const url = import.meta.env.VITE_SUPABASE_URL;
    console.log('Supabase URL:', url ? `${url.substring(0, 20)}...` : 'undefined');
    console.log('Supabase key present:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Try to ping the users table with a simple count query
    const startTime = Date.now();
    console.log('Attempting database query...');
    const { data, error, status, statusText } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('Database query response:', { 
      hasError: !!error, 
      status, 
      statusText,
      responseTime: `${responseTime}ms`
    });
    
    if (error) {
      console.error('Supabase connection test failed (database):', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return {
        success: false,
        error,
        message: `Database connection failed: ${error.message}`,
        details: error.details,
        hint: error.hint,
        code: error.code,
        responseTime
      };
    }
    
    // Also check auth API 
    const authStartTime = Date.now();
    console.log('Attempting auth API check...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    const authEndTime = Date.now();
    const authResponseTime = authEndTime - authStartTime;
    
    console.log('Auth API response:', { 
      hasError: !!authError, 
      hasSession: !!authData?.session,
      responseTime: `${authResponseTime}ms`
    });
    
    if (authError) {
      console.error('Supabase connection test failed (auth):', authError);
      return {
        success: false,
        error: authError,
        message: `Auth API connection failed: ${authError.message}`,
        responseTime,
        authResponseTime
      };
    }
    
    console.log('Supabase connection test passed', {
      dbResponseTime: `${responseTime}ms`,
      authResponseTime: `${authResponseTime}ms`
    });
    
    return {
      success: true,
      message: 'Supabase connection successful',
      responseTime,
      authResponseTime
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorName = err instanceof Error ? err.name : 'Unknown';
    const errorStack = err instanceof Error ? err.stack : undefined;
    
    console.error('Exception during Supabase connection test:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack
    });
    
    return {
      success: false,
      error: err,
      name: errorName,
      message: `Connection exception: ${errorMessage}`,
      stack: errorStack,
      responseTime: -1
    };
  }
}

/**
 * Check if Supabase URL is correctly configured
 */
export function validateSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const issues = [];
  
  if (!url) {
    issues.push('Missing VITE_SUPABASE_URL environment variable');
  } else if (!url.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL should start with https://');
  }
  
  if (!key) {
    issues.push('Missing VITE_SUPABASE_ANON_KEY environment variable');
  } else if (key.trim() === '') {
    issues.push('VITE_SUPABASE_ANON_KEY is empty');
  } else {
    // Add API key analysis to help debug format issues
    const cleanKey = key.replace(/\s+/g, '');
    console.log('API Key analysis:', {
      originalLength: key.length,
      cleanedLength: cleanKey.length,
      hasDifference: key.length !== cleanKey.length,
      startsWithEyJ: cleanKey.startsWith('eyJ'),
      containsSpaces: /\s/.test(key),
      containsNewlines: /\n/.test(key)
    });
    
    if (key.length !== cleanKey.length) {
      issues.push('VITE_SUPABASE_ANON_KEY contains whitespace or newlines that might cause issues');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    url: url ? url.substring(0, 30) + '...' : 'undefined',
    key: key ? `${key.substring(0, 10)}...` : 'undefined',
    keyLength: key?.length
  };
} 