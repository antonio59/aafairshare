// Script to create a default user in the database
import { pool } from './server/db.js';
import bcrypt from 'bcrypt';

async function createDefaultUser() {
  try {
    console.log('Creating default user...');
    
    // Check if the default user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@aafairshare.app']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Default user already exists, skipping creation.');
      await pool.end();
      return;
    }
    
    // Hash the password
    const saltRounds = 10;
    const password = 'admin123'; // You should change this after first login
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert the default user
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      ['Admin', 'admin@aafairshare.app', hashedPassword]
    );
    
    console.log('Default user created successfully.');
    console.log('Email: admin@aafairshare.app');
    console.log('Password: admin123 (please change this after logging in)');
    
    await pool.end();
    
  } catch (error) {
    console.error('Error creating default user:', error);
    process.exit(1);
  }
}

// Run the function
createDefaultUser();