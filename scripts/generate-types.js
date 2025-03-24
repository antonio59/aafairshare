#!/usr/bin/env node

/**
 * This script generates TypeScript types from your Supabase database schema.
 * It requires the Supabase CLI to be installed and properly set up.
 * 
 * Run this script when your database schema changes to keep types in sync.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Output file path
const outputFile = path.join(__dirname, '..', 'src', 'types', 'supabase.ts');

try {
  console.log('Generating Supabase types...');
  
  // Run Supabase CLI to generate types
  const typesOutput = execSync('npx supabase gen types typescript --project-id your-project-id --schema public', {
    encoding: 'utf-8'
  });
  
  // Add additional type definitions for easier access
  const additionalTypes = `
// Define some common types for easier access
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Location = Database['public']['Tables']['locations']['Row']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type User = Database['public']['Tables']['users']['Row']
`;

  // Write to file
  fs.writeFileSync(outputFile, typesOutput + additionalTypes);
  
  console.log(`Types have been generated and saved to ${outputFile}`);
} catch (error) {
  console.error('Error generating types:', error.message);
  console.error('');
  console.error('Make sure the Supabase CLI is installed and you have set up your Supabase project.');
  console.error('Run: npm install -g supabase');
  console.error('Then login: supabase login');
  console.error('');
  console.error('Also update the project ID in this script with your actual Supabase project ID.');
  process.exit(1);
}
