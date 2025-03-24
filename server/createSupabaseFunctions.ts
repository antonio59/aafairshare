import { supabase } from './supabase';
import fs from 'fs';
import { log } from './vite';

/**
 * This script creates the SQL functions in Supabase
 * Run this once before initializing the database
 */
export async function createSupabaseFunctions() {
  try {
    log('Creating SQL functions in Supabase...');
    
    // Read the SQL file content
    const sqlContent = fs.readFileSync('./server/supabaseMigrations.sql', 'utf8');
    
    // Split the content into individual function definitions
    const functionDefinitions = sqlContent.split('CREATE OR REPLACE FUNCTION');
    
    // Skip the first empty element
    for (let i = 1; i < functionDefinitions.length; i++) {
      const functionDef = 'CREATE OR REPLACE FUNCTION' + functionDefinitions[i];
      
      // Execute each function definition
      const { error } = await supabase.rpc('exec_sql', { sql: functionDef });
      
      if (error) {
        console.error(`Error creating function #${i}:`, error);
      } else {
        log(`Created SQL function #${i}`);
      }
    }
    
    log('Created all SQL functions in Supabase');
    return true;
  } catch (error) {
    console.error('Failed to create SQL functions:', error);
    return false;
  }
}