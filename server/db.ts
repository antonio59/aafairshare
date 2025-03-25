
import { log } from './vite';
import { supabase } from './supabase';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Get the connection string from environment variable
const connectionString = process.env.DATABASE_URL;

// Function to execute SQL directly
export async function executeDirectSql(sql: string) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
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
