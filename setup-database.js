// Script to set up the database tables in Supabase
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory name of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import server modules using dynamic import
const serverDir = path.join(__dirname, 'server');

// Custom log function while we wait for the real one to load
function tempLog(message) {
  console.log(`[DATABASE SETUP] ${message}`);
}

// We'll load these dynamically
let executeSqlFileWithPostgres;
let initializeSupabaseDatabase;
let log;

async function setupDatabase() {
  try {
    // Dynamically import the necessary modules
    try {
      const dbModule = await import('./server/db.js');
      executeSqlFileWithPostgres = dbModule.executeSqlFileWithPostgres;
      
      const initSupabaseModule = await import('./server/initSupabase.js');
      initializeSupabaseDatabase = initSupabaseModule.initializeSupabaseDatabase;
      
      const viteModule = await import('./server/vite.js');
      log = viteModule.log;
    } catch (importError) {
      console.error('Error importing modules:', importError);
      log = tempLog; // Fall back to our temporary log function
    }
    
    log('Starting database setup...');
    
    // First try the direct PostgreSQL approach
    log('Attempting to create tables via direct PostgreSQL...');
    const postgresResult = await executeSqlFileWithPostgres();
    
    if (postgresResult.success) {
      log('✅ Successfully created tables via direct PostgreSQL!');
      return;
    }
    
    log(`PostgreSQL direct execution failed: ${postgresResult.message}`);
    log('Trying Supabase initialization...');
    
    // Try Supabase initialization
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