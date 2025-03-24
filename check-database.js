// Script to check if the database tables exist in Supabase
import pkg from 'pg';
const { Pool } = pkg;

async function checkDatabase() {
  // Get the database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    // Check if tables exist
    const tables = ['users', 'categories', 'locations', 'expenses', 'recurring_expenses', 'settlements'];
    const results = {};
    
    for (const table of tables) {
      try {
        // Check if table exists
        const { rowCount } = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [table]);
        
        results[table] = rowCount > 0;
        console.log(`Table '${table}' exists: ${results[table]}`);
      } catch (err) {
        results[table] = false;
        console.error(`Error checking table '${table}':`, err.message);
      }
    }
    
    // Check if any tables need to be created
    const missingTables = tables.filter(table => !results[table]);
    
    if (missingTables.length > 0) {
      console.log(`Missing tables: ${missingTables.join(', ')}`);
      console.log('You need to run the setup-database.js script to create these tables.');
    } else {
      console.log('All required database tables exist!');
    }
    
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});