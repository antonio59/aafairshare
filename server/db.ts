
import { log } from './vite';
import { supabase } from './supabase';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Get the connection string from environment variable
const connectionString = process.env.DATABASE_URL;

// Function to execute SQL directly using service role key
export async function executeDirectSql(sql: string) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If RPC doesn't exist, try direct REST API
      const result = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({ sql })
      });

      if (!result.ok) {
        console.error("SQL execution error:", await result.text());
        return { success: false, message: `Failed to execute SQL: ${sql}` };
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("SQL execution exception:", error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}

// Function to execute SQL file with Postgres
export async function executeSqlFileWithPostgres() {
  try {
    const { data, error } = await supabase.from('_schema_migrations').select('*').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Export database functions and client
export const db = {
  executeDirectSql,
  executeSqlFileWithPostgres
};
