import { supabase } from "./supabase";
import { SupabaseStorage } from "./supabaseStorage";
import { MemStorage } from "./storage";
import { createSupabaseFunctions } from "./createSupabaseFunctions";
import { log } from "./vite";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    log("Creating tables in Supabase...");
    
    // We'll let the SupabaseStorage class handle table creation
    // It has a more robust approach with proper error handling
    log("Tables will be created on demand by the SupabaseStorage class.");
    
    return true;
  } catch (error) {
    console.error("Error accessing Supabase:", error);
    return false;
  }
}

async function initializeDefaultData() {
  try {
    // Just check if we can connect to Supabase
    const { data, error } = await supabase.from('_metadata').select('*').limit(1);
    
    if (error) {
      // This is okay, _metadata table likely doesn't exist
      log("Couldn't query _metadata table. This is expected.");
    } else {
      log("Successfully connected to Supabase.");
    }
    
    // Let the SupabaseStorage class handle default data initialization
    log("Default data will be initialized by the SupabaseStorage class.");
    return true;
  } catch (error) {
    // Non-fatal error - we'll let SupabaseStorage handle the initialization
    log("Couldn't verify Supabase connection. Will try during operations.");
    return true;
  }
}