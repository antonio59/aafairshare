import { createClient } from '@supabase/supabase-js';

// Create Supabase test client
export const supabase = createClient(
  'http://localhost:54321', // Local Supabase instance
  'test-anon-key', // Test anon key
  {
    auth: {
      persistSession: false // Don't persist auth state in tests
    }
  }
);

// Extend Jest matchers
expect.extend({
  toBeValidId(received) {
    const pass = typeof received === 'string' && received.length > 0;
    return {
      message: () => `expected ${received} to be a valid ID string`,
      pass
    };
  }
});
