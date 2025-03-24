import { createClient } from '@supabase/supabase-js';
import { log } from './server/vite.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

async function checkDatabase() {
  try {
    console.log('Checking Supabase connection...');
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_KEY exists:', !!supabaseKey);
    console.log('SUPABASE_SERVICE_KEY exists:', !!supabaseServiceKey);

    // Initialize Supabase client
    const supabase = createClient(
      supabaseUrl || '',
      supabaseServiceKey || supabaseKey || ''
    );

    // Check if tables exist
    const tables = ['users', 'categories', 'locations', 'expenses', 'recurring_expenses', 'settlements'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1);

        if (error) {
          console.error(`Error checking table '${table}':`, error.message);
        } else {
          console.log(`Table '${table}' exists and has ${data[0]?.count || 0} rows`);
        }
      } catch (err) {
        console.error(`Error checking table '${table}':`, err);
      }
    }
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase().catch(console.error);