import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from './vite';

// Access Supabase URL and Key from environment variables directly
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

// Get the current file's directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    // Try to use a direct SQL query approach
    let error = null;
    
    try {
      // Try to use the REST API directly to execute the SQL
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql: sqlContent })
      });
      
      if (!response.ok) {
        error = new Error(`Failed to execute SQL: ${response.statusText}`);
      }
    } catch (err) {
      error = err;
      log('Error executing SQL directly: ' + (err as Error).message);
    }
    
    if (error) {
      // If there was an error, it might be that exec_sql already exists
      // We'll check if we can execute a simple command to verify
      try {
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase credentials');
        }
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql: 'SELECT 1;' })
        });
        
        if (!response.ok) {
          console.error('Error creating exec_sql function, and function does not exist:', error);
          return false;
        } else {
          log('exec_sql function already exists and works.');
        }
      } catch (err) {
        console.error('Error creating exec_sql function, and test query failed:', err);
        return false;
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