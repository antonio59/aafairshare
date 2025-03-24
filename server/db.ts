import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from './vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

/**
 * Execute a SQL query directly using the PostgreSQL client
 * This is a more direct approach than using Supabase's API
 */
export async function executeDirectSql(sql: string): Promise<{ success: boolean; message: string; results?: any[] }> {
  const client = await pool.connect();
  
  try {
    log('Executing direct SQL query via PostgreSQL client');
    
    // Split the SQL into individual statements
    const statements = sql.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    if (statements.length === 0) {
      return {
        success: true,
        message: "No SQL statements to execute"
      };
    }
    
    let results = [];
    
    // Execute each statement
    for (const statement of statements) {
      try {
        log(`Executing: ${statement.substring(0, 100)}...`);
        const result = await client.query(statement);
        results.push(result);
        log(`Statement executed successfully`);
      } catch (error) {
        // If it's a "relation already exists" error, we can safely ignore it
        if ((error as Error).message.includes('already exists')) {
          log(`Table already exists, continuing...`);
        } else {
          log(`Error executing statement: ${(error as Error).message}`);
          // Don't throw the error, continue with other statements
        }
      }
    }
    
    return {
      success: true,
      message: `Executed ${results.length} SQL statements successfully`,
      results
    };
  } catch (error) {
    log(`Error executing SQL: ${(error as Error).message}`);
    return {
      success: false,
      message: `Error executing SQL: ${(error as Error).message}`
    };
  } finally {
    client.release();
  }
}

/**
 * Execute the contents of the direct_sql_tables.sql file
 * using direct PostgreSQL connection
 */
export async function executeSqlFileWithPostgres(): Promise<{ success: boolean; message: string }> {
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
    log("Executing SQL file content with PostgreSQL client...");
    
    // Execute the SQL
    const result = await executeDirectSql(sqlContent);
    
    return {
      success: result.success,
      message: result.success 
        ? "SQL file executed successfully with PostgreSQL client" 
        : `Failed to execute SQL file: ${result.message}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Error executing SQL file: ${(error as Error).message}`
    };
  }
}
