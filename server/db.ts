
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
    const result = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        command: sql
      })
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("SQL execution error:", errorText);
      return { success: false, message: `Failed to execute SQL: ${errorText}` };
    }

    return { success: true };
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
