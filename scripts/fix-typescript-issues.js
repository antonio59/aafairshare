#!/usr/bin/env node

/**
 * Script to fix TypeScript issues across the codebase
 * 1. Run our type import fixer
 * 2. Fix the common cookie issues with awaiting cookies()
 * 3. Fix auth context usage (logout -> signOut)
 * 4. Fix other common issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Starting TypeScript issue fixer...');

// 1. Run the type import fixer
console.log('👉 Step 1: Fixing type imports...');
try {
  execSync('node scripts/fix-imports/fix-type-imports.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error running type import fixer:', error);
  process.exit(1);
}

// 2. Fix cookies() usage
console.log('👉 Step 2: Fixing cookie handling...');
const cookieFiles = glob.sync('src/app/**/*.{ts,tsx}');
for (const file of cookieFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Replace non-awaited cookies() calls
  const updatedContent = content
    .replace(/const\s+cookieStore\s*=\s*cookies\(\)/g, 'const cookieStore = await cookies()')
    .replace(/let\s+cookieStore\s*=\s*cookies\(\)/g, 'let cookieStore = await cookies()');
  
  if (content !== updatedContent) {
    console.log(`  - Fixing cookie handling in ${file}`);
    fs.writeFileSync(file, updatedContent);
  }
}

// 3. Fix auth context usage (logout -> signOut)
console.log('👉 Step 3: Fixing auth context usage...');
const authFiles = glob.sync('src/components/**/*.{ts,tsx}');
for (const file of authFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Replace logout with signOut in destructuring and function calls
  const updatedContent = content
    .replace(/{\s*([^}]*)\blogout\b([^}]*)\s*}/g, '{ $1signOut$2 }')
    .replace(/await\s+logout\(/g, 'await signOut(')
    .replace(/\.logout\(/g, '.signOut(');
  
  if (content !== updatedContent) {
    console.log(`  - Fixing auth context usage in ${file}`);
    fs.writeFileSync(file, updatedContent);
  }
}

// 4. Fix createClient usage to add await
console.log('👉 Step 4: Fixing createClient usage...');
const supabaseFiles = glob.sync('src/**/*.{ts,tsx}');
for (const file of supabaseFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Replace non-awaited createClient calls
  const updatedContent = content
    .replace(/const\s+supabase\s*=\s*createClient\(/g, 'const supabase = await createClient(')
    .replace(/let\s+supabase\s*=\s*createClient\(/g, 'let supabase = await createClient(');
  
  if (content !== updatedContent) {
    console.log(`  - Fixing createClient usage in ${file}`);
    fs.writeFileSync(file, updatedContent);
  }
}

// 5. Remove unused imports
console.log('👉 Step 5: Running ESLint to clean up unused imports...');
try {
  execSync('npm run lint:fix', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Warning: ESLint reported some issues:', error);
  // Don't exit, continue with the process
}

console.log('✅ TypeScript issue fixing completed!');
console.log('');
console.log('Next steps:');
console.log('1. Run "npm run typecheck" to verify all type issues are fixed');
console.log('2. Run "npm run build" to test the build process');
