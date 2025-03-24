-- Direct SQL script to create tables in Supabase PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Expenses table
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
  month TEXT GENERATED ALWAYS AS (to_char(date, 'YYYY-MM')) STORED
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  next_date TIMESTAMP NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  location_id INTEGER REFERENCES locations(id),
  paid_by_user_id INTEGER REFERENCES users(id),
  split_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP NOT NULL,
  month TEXT NOT NULL,
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER REFERENCES users(id),
  notes TEXT
);

-- Insert default users if not exist
INSERT INTO users (username, email, password)
SELECT 'John', 'john@example.com', 'password'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'John')
UNION ALL
SELECT 'Sarah', 'sarah@example.com', 'password'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'Sarah');

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
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transportation')
UNION ALL
SELECT 'Dining', '#FF5722', 'Utensils'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Dining')
UNION ALL
SELECT 'Healthcare', '#00BCD4', 'Stethoscope'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Healthcare')
UNION ALL
SELECT 'Other', '#607D8B', 'Package'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Other');

-- Insert default locations if not exist
INSERT INTO locations (name)
SELECT 'Tesco'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Tesco')
UNION ALL
SELECT 'Amazon'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Amazon')
UNION ALL
SELECT 'Asda'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Asda')
UNION ALL
SELECT 'Sainsbury''s'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Sainsbury''s')
UNION ALL
SELECT 'Lidl'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Lidl')
UNION ALL
SELECT 'Aldi'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Aldi')
UNION ALL
SELECT 'Online'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Online')
UNION ALL
SELECT 'Other'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Other');