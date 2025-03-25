// Script to set up the database tables in Supabase
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory name of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom log function while we wait for the real one to load
function tempLog(message) {
  console.log(`[DATABASE SETUP] ${message}`);
}

let initializeSupabaseDatabase;
let log;

async function setupDatabase() {
  try {
    // Dynamically import the necessary modules
    try {
      const initSupabaseModule = await import('./dist/server/initSupabase.js');
      initializeSupabaseDatabase = initSupabaseModule.initializeSupabaseDatabase;

      const viteModule = await import('./server/vite.js');
      log = viteModule.log;
    } catch (importError) {
      console.error('Error importing modules:', importError);
      log = tempLog; // Fall back to our temporary log function
    }

    log('Starting database setup...');

    // Initialize Supabase database
    const supabaseResult = await initializeSupabaseDatabase();

    if (supabaseResult) {
      log('✅ Successfully initialized Supabase database!');
      return;
    }

    log('Failed to initialize database. Check credentials and permissions.');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Execute the setup function
tempLog('Starting the database setup script...');
setupDatabase().then(() => {
  tempLog('Database setup script completed.');
}).catch(err => {
  console.error('Unhandled error in database setup:', err);
  process.exit(1);
});