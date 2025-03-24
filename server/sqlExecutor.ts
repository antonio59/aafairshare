import { supabase } from './supabase';
import { log } from './vite';

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
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || (import.meta.env.SUPABASE_URL as string);
    const supabaseKey = process.env.SUPABASE_KEY || (import.meta.env.SUPABASE_KEY as string);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return { success: false, message: "Missing Supabase credentials" };
    }
    
    console.log("Executing SQL:", sql.substring(0, 100) + (sql.length > 100 ? "..." : ""));
    
    // For Supabase, we can't execute arbitrary SQL directly through the REST API
    // However, we can use the Supabase client to perform operations that match our needs
    
    try {
      // Check what kind of operation we're trying to perform
      const operation = sql.trim().split(/\s+/)[0].toUpperCase();
      
      if (operation === 'CREATE' && sql.includes('TABLE IF NOT EXISTS')) {
        // This is a table creation - we can check if the table exists
        // and if not, create it using the regular API
        const tableName = sql.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i)?.[1];
        
        if (!tableName) {
          return { 
            success: false, 
            message: "Could not extract table name from CREATE TABLE statement" 
          };
        }
        
        // Try checking if the table exists by querying it
        try {
          await supabase.from(tableName).select('count').limit(1);
          // If we get here, the table exists
          return { success: true, message: `Table ${tableName} already exists` };
        } catch (tableError: any) {
          if (tableError.code === '42P01') { // Table doesn't exist
            // We couldn't create the table through SQL directly, but we can 
            // inform the caller so they can use the regular API methods
            return { 
              success: false, 
              message: `Table ${tableName} doesn't exist and must be created using the Supabase API`,
              tableName
            };
          } else {
            // Some other error
            return { 
              success: false, 
              message: `Error checking if table ${tableName} exists: ${tableError.message}`
            };
          }
        }
      }
      
      // For other operations, we use the regular Supabase client methods
      // This is a fallback that will almost certainly not work for raw SQL
      console.log("Warning: Direct SQL execution is not supported. Using Supabase client API instead.");
      return { 
        success: false, 
        message: "Direct SQL execution not supported in this environment. Please use the Supabase API methods."
      };
    } catch (err) {
      console.error("Error in SQL execution logic:", err);
      return { 
        success: false, 
        message: `Error in SQL execution logic: ${(err as Error).message}`
      };
    }
  } catch (error) {
    console.error("Failed to execute SQL:", error);
    return { success: false, message: `Failed to execute SQL: ${(error as Error).message}` };
  }
}

/**
 * Create a table if it doesn't exist
 * This is a helper function to create tables with the proper schema
 */
export async function createTableIfNotExists(tableName: string, tableSchema: string): Promise<PostgresResult> {
  try {
    // First check if the table exists
    try {
      const { error } = await supabase.from(tableName).select('count').limit(1);
      
      if (!error) {
        // Table exists
        return { success: true, message: `Table ${tableName} already exists` };
      }
      
      if (error.code !== '42P01') {
        // Some other error
        return { success: false, message: `Error checking table ${tableName}: ${error.message}` };
      }
    } catch (err) {
      // Continue to create the table
    }
    
    // Table doesn't exist, create it
    const sql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${tableSchema}
      );
    `;
    
    return await executeSql(sql);
  } catch (error) {
    console.error(`Failed to create table ${tableName}:`, error);
    return { success: false, message: `Failed to create table ${tableName}: ${(error as Error).message}` };
  }
}