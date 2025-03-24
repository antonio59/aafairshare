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
    
    // Create users table
    const { error: usersError } = await supabase.from('users').insert([]).select().limit(0);
    if (usersError && usersError.code !== '23505') { // Ignore duplicate errors
      // If the table doesn't exist, create it
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );
        `
      });
      
      if (error && error.code !== 'PGRST202') {
        // If exec_sql function doesn't exist or fails, try direct REST API
        log("Cannot create tables via exec_sql. Using direct API...");
        
        // Default users to insert
        const defaultUsers = [
          { username: 'John', password: 'password' },
          { username: 'Sarah', password: 'password' }
        ];
        
        // Try to insert users directly
        const { error: insertError } = await supabase.from('users').insert(defaultUsers);
        if (insertError && insertError.code !== '23505') { // Ignore duplicate errors
          log("Failed to create users table or insert default users.");
        } else {
          log("Created users table and inserted default users.");
        }
      }
    } else {
      log("Users table already exists.");
    }
    
    // Create categories table
    const { error: categoriesError } = await supabase.from('categories').insert([]).select().limit(0);
    if (categoriesError && categoriesError.code !== '23505') {
      // If the table doesn't exist, try inserting default categories
      const defaultCategories = [
        { name: 'Groceries', color: '#4CAF50', icon: 'ShoppingCart' },
        { name: 'Rent', color: '#2196F3', icon: 'Home' },
        { name: 'Utilities', color: '#FFC107', icon: 'Lightbulb' },
        { name: 'Entertainment', color: '#9C27B0', icon: 'Film' },
        { name: 'Transportation', color: '#F44336', icon: 'Car' },
        { name: 'Dining', color: '#FF5722', icon: 'Utensils' },
        { name: 'Healthcare', color: '#00BCD4', icon: 'Stethoscope' },
        { name: 'Other', color: '#607D8B', icon: 'Package' }
      ];
      
      const { error: insertError } = await supabase.from('categories').insert(defaultCategories);
      if (insertError && insertError.code !== '23505') {
        log("Failed to create categories table or insert defaults.");
      } else {
        log("Created categories table and inserted defaults.");
      }
    } else {
      log("Categories table already exists.");
    }
    
    // Create locations table
    const { error: locationsError } = await supabase.from('locations').insert([]).select().limit(0);
    if (locationsError && locationsError.code !== '23505') {
      // If the table doesn't exist, try inserting default locations
      const defaultLocations = [
        { name: 'Supermarket' },
        { name: 'Restaurant' },
        { name: 'Online' },
        { name: 'Cinema' },
        { name: 'Pharmacy' },
        { name: 'Gas Station' },
        { name: 'Home' },
        { name: 'Other' }
      ];
      
      const { error: insertError } = await supabase.from('locations').insert(defaultLocations);
      if (insertError && insertError.code !== '23505') {
        log("Failed to create locations table or insert defaults.");
      } else {
        log("Created locations table and inserted defaults.");
      }
    } else {
      log("Locations table already exists.");
    }
    
    // Expenses table will be created via REST API if needed during operations
    
    log("Completed table setup in Supabase.");
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