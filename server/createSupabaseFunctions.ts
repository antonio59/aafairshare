import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';
import { log } from './vite';

/**
 * This script creates the SQL functions in Supabase
 * Run this once before initializing the database
 */
export async function createSupabaseFunctions() {
  try {
    log('Creating SQL execution function in Supabase...');
    
    // First, we need to create the exec_sql function for executing arbitrary SQL
    // This is done directly against the Supabase database
    const sqlFilePath = path.resolve(__dirname, 'execSqlFunction.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL function file not found at ${sqlFilePath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL directly to create the exec_sql function
    // Since we can't use execute directly, we'll use a raw HTTP request to Supabase
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent }).catch(() => {
      // If this fails, it's likely because the function doesn't exist yet
      // We'll try a different approach
      return { error: new Error('exec_sql function does not exist yet') };
    });
    
    if (error) {
      // If there was an error, it might be that exec_sql already exists
      // We'll check if we can execute a simple command to verify
      const { error: testError } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
      
      if (testError) {
        console.error('Error creating exec_sql function, and function does not exist:', error);
        return false;
      } else {
        log('exec_sql function already exists and works.');
      }
    } else {
      log('Created exec_sql function in Supabase');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to create SQL functions:', error);
    return false;
  }
}