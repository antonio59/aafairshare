
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
    const { data, error } = await supabase.from('_backend').select('*').filter('id', 'eq', 1);
    
    // If error about table not existing, create it first
    if (error && error.code === '42P01') {
      const { error: createError } = await supabase
        .auth.admin.queryDb(sql);
      
      if (createError) {
        console.error("SQL execution error:", createError);
        return { success: false, message: createError.message };
      }
      return { success: true };
    }
    
    // Execute the actual query
    const { error: queryError } = await supabase
      .auth.admin.queryDb(sql);
    
    if (queryError) {
      console.error("SQL execution error:", queryError);
      return { success: false, message: queryError.message };
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
