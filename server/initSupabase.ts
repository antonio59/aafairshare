import { supabase } from "./supabase";
import { SupabaseStorage } from "./supabaseStorage";
import { MemStorage } from "./storage";
import { createSupabaseFunctions } from "./createSupabaseFunctions";
import { log } from "./vite";

/**
 * Initialize the Supabase database with default data
 * This script creates the necessary tables and default data in Supabase
 */
export async function initializeSupabaseDatabase() {
  log("Initializing Supabase database...");
  
  try {
    // First check if the database is already initialized by checking for users table
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    // If we can access the users table and it has data, we're already initialized
    if (!checkError && existingUsers && existingUsers.length > 0) {
      log("Supabase database already initialized.");
      return true;
    }
    
    // We need to create the SQL functions first
    log("Creating SQL functions in Supabase...");
    await createSupabaseFunctions();
    
    // If we get here, we need to initialize the database
    log("Setting up Supabase database tables and initial data...");
    
    // Create the necessary tables
    await createTables();
    
    // Initialize with default data from MemStorage
    await initializeDefaultData();
    
    log("Supabase database initialized successfully!");
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase database:", error);
    return false;
  }
}

async function createTables() {
  try {
    // Read the SQL file content
    const fs = require('fs');
    const path = require('path');
    const sqlFilePath = path.resolve(__dirname, 'supabaseMigrations.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at ${sqlFilePath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL script using the exec_sql function
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      throw error;
    }
    
    log("Created all tables in Supabase using migration script.");
    return true;
  } catch (error) {
    console.error("Error creating tables:", error);
    return false;
  }
}

async function initializeDefaultData() {
  try {
    // Check if default data was successfully inserted by the migration script
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      throw usersError;
    }
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*');
    
    if (locationsError) {
      throw locationsError;
    }
    
    log(`Verified default data in Supabase: ${users.length} users, ${categories.length} categories, ${locations.length} locations`);
    return true;
  } catch (error) {
    console.error("Error verifying default data:", error);
    return false;
  }
}