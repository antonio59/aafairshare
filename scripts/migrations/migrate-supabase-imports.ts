/**
 * Supabase Import Migration Script
 * 
 * This script migrates deprecated Supabase client imports to the standardized path.
 * For detailed technical documentation, see docs/supabase-migration.md
 * 
 * Usage options: 
 * 1. Using npx: npx tsx scripts/migrations/migrate-supabase-imports.ts
 * 2. Using node with ts-node: npx ts-node scripts/migrations/migrate-supabase-imports.ts
 * 3. Using node with esbuild-register: node -r esbuild-register scripts/migrations/migrate-supabase-imports.ts
 * 4. Compile to JS first: npx tsc scripts/migrations/migrate-supabase-imports.ts && node scripts/migrations/migrate-supabase-imports.js
 * 
 * Or use the wrapper script: ./scripts/migrations/migrate-imports.sh
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Configuration section
 * =====================
 * List of files known to contain deprecated imports.
 * Add new files to this list if they use the old import pattern.
 */
const FILES_TO_UPDATE: string[] = [
  'src/services/settingsService.ts',
  'src/services/userService.ts',
  'src/services/aiService.ts',
  'src/services/importExportService.ts',
  'src/services/settlementService.ts',
  'src/test-supabase.ts',
  'src/features/settlements/hooks/useSettlementGuard.ts',
  // Add any other files with deprecated imports here
];

// Regular expression to match the deprecated import pattern
const SEARCH_PATTERN = /import\s+\{\s*supabase\s*\}\s+from\s+['"].*?lib\/supabase['"];?/g;

// The standardized import statement to use
const REPLACEMENT = `import { supabase } from '@/core/api/supabase';`;

/**
 * Result interface for processing each file
 * Contains status information and message for reporting
 */
interface ProcessResult {
  filePath: string;
  success: boolean;
  message: string;
}

// Start execution with a header message
console.log('Starting migration of deprecated supabase imports...');
console.log('=============================================');

/**
 * Main processing logic
 * =====================
 * Process each file in the FILES_TO_UPDATE list:
 * 1. Check if the file exists
 * 2. Read the file's contents
 * 3. Check if it contains deprecated imports
 * 4. Replace the imports if found
 * 5. Write the updated content back to the file
 */
const results: ProcessResult[] = FILES_TO_UPDATE.map(filePath => {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  try {
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return {
        filePath,
        success: false,
        message: 'File not found - skipping'
      };
    }
    
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if the file contains the deprecated import
    if (!SEARCH_PATTERN.test(content)) {
      return {
        filePath,
        success: true,
        message: 'No deprecated imports found - skipping'
      };
    }
    
    // Reset regex lastIndex
    SEARCH_PATTERN.lastIndex = 0;
    
    // Replace the import
    const updatedContent = content.replace(SEARCH_PATTERN, REPLACEMENT);
    
    // Write the updated content back to the file
    fs.writeFileSync(fullPath, updatedContent, 'utf8');
    
    return {
      filePath,
      success: true,
      message: 'Updated imports successfully'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      filePath,
      success: false,
      message: `Error: ${errorMessage}`
    };
  }
});

/**
 * Results reporting
 * ================
 * Display detailed results for each file and a summary
 */
console.log('\nMigration Results:');
console.log('=================');

results.forEach(result => {
  const icon = result.success ? '✅' : '❌';
  console.log(`${icon} ${result.filePath}: ${result.message}`);
});

// Calculate success/failure statistics
const successCount = results.filter(r => r.success).length;
const failCount = results.length - successCount;

// Print summary information
console.log('\nSummary:');
console.log(`Total files processed: ${results.length}`);
console.log(`Success: ${successCount}`);
console.log(`Failed: ${failCount}`);

console.log('\nReminder: The script has updated imports to use @/core/api/supabase.');
console.log('Make sure your tsconfig.json has proper path aliases configured for the @ symbol.');

/**
 * TypeScript validation
 * ===================
 * Run the TypeScript compiler to check for any type errors after the migration
 */
try {
  console.log('\nRunning TypeScript to check for errors...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('TypeScript check completed successfully.');
} catch (error) {
  console.error('TypeScript found errors. Please check and fix them manually.');
} 