
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { log } from './vite';

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create drizzle database instance
export const db = drizzle(pool);

// Function to initialize database tables
export async function initializeDatabase() {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );

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

    // Insert default data
    await pool.query(`
      INSERT INTO users (username, email, password)
      SELECT 'John', 'john@example.com', 'password'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'John')
      UNION ALL
      SELECT 'Sarah', 'sarah@example.com', 'password'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'Sarah');

      INSERT INTO categories (name, color, icon)
      SELECT 'Groceries', '#4CAF50', 'ShoppingCart'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Groceries')
      UNION ALL
      SELECT 'Rent', '#2196F3', 'Home'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rent')
      UNION ALL
      SELECT 'Utilities', '#FFC107', 'Lightbulb'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Utilities');

      INSERT INTO locations (name)
      SELECT 'Supermarket'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Supermarket')
      UNION ALL
      SELECT 'Restaurant'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Restaurant')
      UNION ALL
      SELECT 'Online'
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Online');
    `);

    log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}
