import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from './vite';

// Get the current file's directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PostgresResult {
  success: boolean;
  message: string;
  tableName?: string; // Added for table creation info
}

/**
 * Execute SQL statements directly against the Supabase database
 * This is used for operations that can't be done with the Supabase API
 */
export async function executeSql(sql: string): Promise<PostgresResult> {
  try {
    console.log("Executing SQL directly...");
    
    // First try to use the exec_sql RPC function
    try {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error("RPC exec_sql error:", error);
        throw error;
      }
      
      return { 
        success: true, 
        message: "SQL executed successfully via RPC" 
      };
    } catch (rpcError) {
      console.error("Failed to execute SQL via RPC. Error:", rpcError);
      
      // Try fallback method - make direct HTTP request to Supabase
      try {
        console.log("Attempting direct REST API execution...");
        
        const supabaseUrl = process.env.SUPABASE_URL || (import.meta.env.SUPABASE_URL as string);
        const supabaseKey = process.env.SUPABASE_KEY || (import.meta.env.SUPABASE_KEY as string);
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase credentials not available");
        }
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`REST API execution failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        return { 
          success: true, 
          message: "SQL executed successfully via REST API" 
        };
      } catch (restError) {
        console.error("REST API execution failed:", restError);
        throw restError;
      }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error executing SQL: ${(error as Error).message}`
    };
  }
}

/**
 * Create a table if it doesn't exist
 * This is a helper function to create tables with the proper schema
 */
export async function createTableIfNotExists(tableName: string, tableSchema: string): Promise<PostgresResult> {
  try {
    console.log(`Creating table ${tableName} if it doesn't exist...`);
    
    const result = await executeSql(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${tableSchema}
      );
    `);
    
    return {
      ...result,
      tableName,
      message: result.success 
        ? `Table ${tableName} created or already exists` 
        : `Failed to create table ${tableName}: ${result.message}`
    };
  } catch (error) {
    return { 
      success: false, 
      tableName,
      message: `Error creating table ${tableName}: ${(error as Error).message}`
    };
  }
}

/**
 * Execute the contents of the direct_sql_tables.sql file
 * to create all tables at once
 */
export async function executeSqlFile(): Promise<PostgresResult> {
  try {
    // Read the SQL file
    const sqlFilePath = path.resolve(__dirname, 'direct_sql_tables.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      return {
        success: false,
        message: `SQL file not found at ${sqlFilePath}`
      };
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log("Executing SQL file content...");
    
    // Execute the SQL
    const result = await executeSql(sqlContent);
    
    return {
      ...result,
      message: result.success 
        ? "SQL file executed successfully" 
        : `Failed to execute SQL file: ${result.message}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Error executing SQL file: ${(error as Error).message}`
    };
  }
}