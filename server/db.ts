import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { log } from './vite';
import { supabase } from './supabase';

// Export the database instance for use with Supabase
export const db = drizzle(supabase, { schema });