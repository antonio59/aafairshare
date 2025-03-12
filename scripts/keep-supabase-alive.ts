#!/usr/bin/env tsx

/**
 * This script pings the Supabase instance to keep it active.
 * It should be run on a schedule (e.g., weekly) to prevent
 * the Supabase instance from being paused due to inactivity.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env files
function loadEnv() {
  const envFiles = ['.env', '.env.local', '.env.development'];
  
  for (const file of envFiles) {
    const envPath = resolve(process.cwd(), file);
    if (existsSync(envPath)) {
      console.log(`Loading environment from ${file}`);
      config({ path: envPath });
      
      // If we have the Supabase URL and key, we can break the loop
      if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
        break;
      }
    }
  }
}

// Load environment variables
loadEnv();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'present' : 'missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'present' : 'missing'
  });
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function pingSupabase(): Promise<void> {
  console.log('Pinging Supabase instance to keep it active...');
  
  try {
    // Perform a simple database query to keep the instance active
    // Using a simpler query that doesn't use aggregate functions
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error pinging Supabase:', error.message);
      process.exit(1);
    }
    
    console.log('Successfully pinged Supabase instance:', { 
      timestamp: new Date().toISOString(),
      dataReceived: !!data,
      itemCount: Array.isArray(data) ? data.length : 0
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error pinging Supabase:', 
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Execute the function
pingSupabase(); 