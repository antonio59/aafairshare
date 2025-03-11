// DEPRECATED - Import from '@/core/api/supabase' instead
// This file only exists for backward compatibility

import { supabase } from '../core/api/supabase';

// Display a warning in development to help us find and update old imports
if (import.meta.env.DEV) {
  console.warn(
    'WARNING: Using deprecated supabase import from lib/supabase.ts. ' +
    'Update your import to use: import { supabase } from "@/core/api/supabase" instead.'
  );
}

export { supabase }; 