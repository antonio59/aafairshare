import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get environment variables directly
const supabaseUrl = 'https://ccwcbnfnvkmwubkuvzns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjd2NibmZudmttd3Via3V2em5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzI0MDcsImV4cCI6MjA1NjcwODQwN30.tgbRreo_VKimkIcs9FvV6Vy1nUaAmLwd8ptwHXmI8GI';

console.log('Creating direct Supabase client with URL:', supabaseUrl);

// Create a simple Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

console.log('Direct Supabase client created');

interface SettingsRow {
  id: string;
  user_id: string;
  currency: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

// Test Supabase connection
async function testDirectConnection(): Promise<void> {
  try {
    console.log('Testing direct connection...');
    
    // Test auth
    console.log('Testing auth directly...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Direct auth test result:', { 
      hasSession: !!authData?.session,
      hasError: !!authError,
      errorMessage: authError?.message
    });

    // Test database query
    console.log('Testing database query directly...');
    const { data: dbData, error: dbError } = await supabase
      .from('settings')
      .select('*')
      .limit(1) as { data: SettingsRow[] | null, error: Error | null };
    
    console.log('Direct database test result:', { 
      hasData: !!dbData,
      dataCount: dbData?.length,
      hasError: !!dbError,
      errorMessage: dbError?.message
    });

    console.log('All direct tests completed');
  } catch (error) {
    console.error('Error during direct tests:', error instanceof Error ? error.message : String(error));
  }
}

testDirectConnection();

export default testDirectConnection; 