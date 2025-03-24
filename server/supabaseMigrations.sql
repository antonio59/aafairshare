-- Create tables for the AAFairShare expense management app

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
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
  amount TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  paid_by_user_id INTEGER NOT NULL REFERENCES users(id),
  split_type TEXT NOT NULL,
  notes TEXT
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  paid_by_user_id INTEGER NOT NULL REFERENCES users(id),
  split_type TEXT NOT NULL,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id SERIAL PRIMARY KEY,
  amount TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  month TEXT NOT NULL,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  notes TEXT
);

-- Default data
INSERT INTO users (username, email, password) 
VALUES 
  ('John', 'john@example.com', 'password'),
  ('Sarah', 'sarah@example.com', 'password')
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;