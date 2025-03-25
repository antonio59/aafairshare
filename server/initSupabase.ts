import { supabase } from "./supabase";
import { SupabaseStorage } from "./supabaseStorage";
import { MemStorage } from "./storage";
import { createSupabaseFunctions } from "./createSupabaseFunctions";
import { executeDirectSql } from "./db";
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
      log("Supabase database already initialized with users.");
      return true;
    }

    // If the table exists but is empty, we'll assume the schema is there but needs data
    if (!checkError && (!existingUsers || existingUsers.length === 0)) {
      log("Supabase users table exists but might be empty. Adding default data...");
      await initializeDefaultData();
      return true;
    }

    // We need to create the SQL functions and tables
    log("Database tables not found. Creating database structure...");
    const functionsResult = await createSupabaseFunctions();

    if (!functionsResult) {
      log("Warning: Database creation via createSupabaseFunctions failed. Attempting another approach...");
      // Create the necessary tables using direct SQL
      await createTables();
    } else {
      log("Database structure created successfully!");
    }

    // Initialize with default data
    await initializeDefaultData();

    log("Supabase database initialization completed!");
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase database:", error);
    return false;
  }
}

async function createTables() {
  try {
    log("Creating tables via direct SQL...");

    // Read and execute the SQL file directly
    const sqlFilePath = path.resolve(__dirname, 'direct_sql_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute each statement separately
    const statements = sqlContent.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          log(`Warning executing statement: ${error.message}`);
        } else {
          log(`Successfully executed SQL statement`);
        }
      } catch (stmtError) {
        log(`Error executing statement: ${stmtError.message}`);
      }
    }

    log("Completed SQL execution");

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

    // Create locations table using SQL
    const createTableResult = await executeDirectSql(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

    if (!createTableResult.success) {
      console.error("Failed to create locations table:", createTableResult.message);
    } else {
      console.log("Locations table created successfully");

      // Now insert default locations
      const { error: insertError } = await supabase.from('locations').insert([
        { name: 'Supermarket' },
        { name: 'Restaurant' },
        { name: 'Online' },
        { name: 'Cinema' },
        { name: 'Pharmacy' },
        { name: 'Gas Station' },
        { name: 'Home' },
        { name: 'Other' }
      ]);

      if (insertError) {
        console.error("Error adding default locations:", insertError);
      } else {
        console.log("Added default locations successfully");
      }
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

    log("Tables creation completed via direct SQL.");
    return true;
  } catch (error) {
    console.error("Error creating tables via direct SQL:", error);
    log("Tables will now be created on demand by the SupabaseStorage class.");
    return false;
  }
}

async function initializeDefaultData() {
  try {
    log("Inserting default data via direct PostgreSQL connection...");

    // Insert default users if there are none
    await executeDirectSql(`
      INSERT INTO users (username, email, password)
      SELECT 'John', 'john@example.com', 'password'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'John')
      UNION ALL
      SELECT 'Sarah', 'sarah@example.com', 'password'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'Sarah');
    `);

    // Insert default categories
    await executeDirectSql(`
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

    // Insert default locations
    await executeDirectSql(`
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

    log("Default data insertion completed.");
    return true;
  } catch (error) {
    console.error("Error inserting default data:", error);
    log("Default data will be initialized by the SupabaseStorage class.");
    return true;
  }
}