import { supabase } from "./supabase";
import { SupabaseStorage } from "./supabaseStorage";
import { MemStorage } from "./storage";
import { createSupabaseFunctions } from "./createSupabaseFunctions";
import { executeSqlFile, executeSql } from "./sqlExecutor";
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
    const functionsResult = await createSupabaseFunctions();
    
    if (!functionsResult) {
      log("Warning: Failed to create SQL functions. Will try direct table creation...");
    } else {
      log("SQL functions created successfully.");
    }
    
    // If we get here, we need to initialize the database
    log("Setting up Supabase database tables and initial data...");
    
    // Create the necessary tables using direct SQL
    await createTables();
    
    // Initialize with default data
    await initializeDefaultData();
    
    log("Supabase database initialization attempted!");
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase database:", error);
    return false;
  }
}

async function createTables() {
  try {
    log("Creating tables in Supabase via direct SQL...");
    
    // Try to execute the full SQL file first
    const sqlFileResult = await executeSqlFile();
    
    if (sqlFileResult.success) {
      log("Successfully created tables via SQL file execution!");
      return true;
    }
    
    log("SQL file execution failed. Error: " + sqlFileResult.message);
    log("Falling back to individual table creation...");
    
    // Create Users Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create Categories Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create Locations Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create Expenses Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        paid_by INTEGER NOT NULL REFERENCES users(id),
        split_type TEXT NOT NULL DEFAULT '50/50',
        notes TEXT,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        location_id INTEGER NOT NULL REFERENCES locations(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create Recurring Expenses Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        frequency TEXT NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        next_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        paid_by INTEGER NOT NULL REFERENCES users(id),
        split_type TEXT NOT NULL DEFAULT '50/50',
        notes TEXT,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        location_id INTEGER NOT NULL REFERENCES locations(id),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create Settlements Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS settlements (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        month TEXT NOT NULL,
        from_user_id INTEGER NOT NULL REFERENCES users(id),
        to_user_id INTEGER NOT NULL REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    log("Tables creation attempted via direct SQL.");
    return true;
  } catch (error) {
    console.error("Error creating tables via direct SQL:", error);
    log("Tables will now be created on demand by the SupabaseStorage class.");
    return false;
  }
}

async function initializeDefaultData() {
  try {
    log("Inserting default data via direct SQL...");
    
    // Insert default users if there are none
    await executeSql(`
      INSERT INTO users (username, email, password) 
      VALUES 
        ('John', 'john@example.com', 'password'),
        ('Sarah', 'sarah@example.com', 'password')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    // Insert default categories
    await executeSql(`
      INSERT INTO categories (name, color, icon) 
      VALUES
        ('Groceries', '#4CAF50', 'ShoppingCart'),
        ('Rent', '#2196F3', 'Home'),
        ('Utilities', '#FFC107', 'Lightbulb'),
        ('Entertainment', '#9C27B0', 'Film'),
        ('Transportation', '#F44336', 'Car'),
        ('Dining', '#FF5722', 'Utensils'),
        ('Healthcare', '#00BCD4', 'Stethoscope'),
        ('Other', '#607D8B', 'Package')
      ON CONFLICT (name) DO NOTHING;
    `);
    
    // Insert default locations
    await executeSql(`
      INSERT INTO locations (name)
      VALUES
        ('Supermarket'),
        ('Restaurant'),
        ('Online'),
        ('Cinema'),
        ('Pharmacy'),
        ('Gas Station'),
        ('Home'),
        ('Other')
      ON CONFLICT (name) DO NOTHING;
    `);
    
    log("Default data insertion attempted.");
    return true;
  } catch (error) {
    console.error("Error inserting default data:", error);
    log("Default data will be initialized by the SupabaseStorage class.");
    return true;
  }
}