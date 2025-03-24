import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from './vite';
import { executeDirectSql, executeSqlFileWithPostgres } from './db';

// Access Supabase URL and Keys from environment variables directly
const supabaseUrl = process.env.SUPABASE_URL || (import.meta.env.SUPABASE_URL as string);
const supabaseKey = process.env.SUPABASE_KEY || (import.meta.env.SUPABASE_KEY as string);
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || (import.meta.env.SUPABASE_SERVICE_KEY as string);
// Prefer using the service key for admin operations if available
const apiKey = supabaseServiceKey || supabaseKey;

// Get the current file's directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This script creates the SQL functions in Supabase
 * Run this once before initializing the database
 */
export async function createSupabaseFunctions() {
  try {
    log('Using direct PostgreSQL connection to create database structures...');
    
    // Use the PostgreSQL direct connection instead of REST API
    if (!process.env.DATABASE_URL) {
      log('No DATABASE_URL environment variable found. Cannot create database objects.');
      return false;
    }
    
    // Execute the entire SQL file directly with PostgreSQL
    const result = await executeSqlFileWithPostgres();
    
    if (result.success) {
      log('Successfully created database objects via direct SQL execution');
      return true;
    }
    
    log(`Direct SQL file execution failed: ${result.message}`);
    log('Trying to create tables one by one...');
    
    // Try creating tables one by one if the full script failed
    
    // Create users table
    const usersResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    if (!usersResult.success) {
      log(`Failed to create users table: ${usersResult.message}`);
    } else {
      log('Created users table successfully');
    }
    
    // Create categories table
    const categoriesResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT
      );
    `);
    
    if (!categoriesResult.success) {
      log(`Failed to create categories table: ${categoriesResult.message}`);
    } else {
      log('Created categories table successfully');
    }
    
    // Create locations table
    const locationsResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    
    if (!locationsResult.success) {
      log(`Failed to create locations table: ${locationsResult.message}`);
    } else {
      log('Created locations table successfully');
    }
    
    // Create expenses table
    const expensesResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        location_id INTEGER REFERENCES locations(id),
        paid_by_user_id INTEGER REFERENCES users(id),
        split_type TEXT NOT NULL,
        notes TEXT,
        month TEXT
      );
    `);
    
    if (!expensesResult.success) {
      log(`Failed to create expenses table: ${expensesResult.message}`);
    } else {
      log('Created expenses table successfully');
    }
    
    // Create recurring expenses table
    const recurringExpensesResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        frequency TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        next_date TIMESTAMP NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        location_id INTEGER REFERENCES locations(id),
        paid_by_user_id INTEGER REFERENCES users(id),
        split_type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        notes TEXT
      );
    `);
    
    if (!recurringExpensesResult.success) {
      log(`Failed to create recurring_expenses table: ${recurringExpensesResult.message}`);
    } else {
      log('Created recurring_expenses table successfully');
    }
    
    // Create settlements table
    const settlementsResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS settlements (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP NOT NULL,
        month TEXT NOT NULL,
        from_user_id INTEGER REFERENCES users(id),
        to_user_id INTEGER REFERENCES users(id),
        notes TEXT
      );
    `);
    
    if (!settlementsResult.success) {
      log(`Failed to create settlements table: ${settlementsResult.message}`);
    } else {
      log('Created settlements table successfully');
    }
    
    // Insert default data
    await executeDirectSql(`
      -- Insert default users if not exist
      INSERT INTO users (username, email, password)
      SELECT 'John', 'john@example.com', 'password'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'John')
      UNION ALL
      SELECT 'Sarah', 'sarah@example.com', 'password'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'Sarah');
    `);
    
    await executeDirectSql(`
      -- Insert default categories if not exist
      INSERT INTO categories (name, color, icon)
      SELECT 'Groceries', '#4CAF50', 'ShoppingCart'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Groceries')
      UNION ALL
      SELECT 'Rent', '#2196F3', 'Home'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rent')
      UNION ALL
      SELECT 'Utilities', '#FFC107', 'Lightbulb'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Utilities')
      UNION ALL
      SELECT 'Entertainment', '#9C27B0', 'Film'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Entertainment')
      UNION ALL
      SELECT 'Transportation', '#F44336', 'Car'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transportation');
    `);
    
    await executeDirectSql(`
      -- Insert default locations if not exist
      INSERT INTO locations (name)
      SELECT 'Tesco'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Tesco')
      UNION ALL
      SELECT 'Amazon'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Amazon')
      UNION ALL
      SELECT 'Sainsbury''s'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Sainsbury''s')
      UNION ALL
      SELECT 'Online'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Online')
      UNION ALL
      SELECT 'Other'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Other');
    `);
    
    log('Database tables and default data created via direct PostgreSQL connection!');
    return true;
  } catch (error) {
    console.error('Failed to create SQL functions:', error);
    return false;
  }
}