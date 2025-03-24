import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize Supabase client
let supabase: ReturnType<typeof createClient>;

if (!supabaseUrl || !supabaseKey) {
  log('Missing Supabase credentials. Using in-memory storage instead.');
  // Create a dummy client that will not be used but allows imports to work
  supabase = createClient('https://placeholder.supabase.co', 'placeholder_key');
} else {
  log('Initializing Supabase client with provided credentials.');
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };