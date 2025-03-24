#!/usr/bin/env node

/**
 * Script to test all the fixes we've made
 * 1. Make sure node has execute permissions for all scripts
 * 2. Run the fix:ts script
 * 3. Try to build the project
 * 4. Report results
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Starting build test...');

// Make scripts executable
console.log('👉 Making scripts executable...');
try {
  execSync('chmod +x scripts/fix-typescript-issues.js scripts/fix-imports/fix-type-imports.js', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Warning: Could not make scripts executable:', error);
}

// Run the TypeScript fixes
console.log('👉 Running TypeScript fixes...');
try {
  execSync('npm run fix:ts', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error running TypeScript fixes:', error);
  process.exit(1);
}

// Run build with error capture
console.log('👉 Testing build...');
let buildSuccess = false;
try {
  execSync('npm run build', { stdio: 'inherit' });
  buildSuccess = true;
} catch (error) {
  console.error('❌ Build failed with error:', error);
}

if (buildSuccess) {
  console.log('✅ Success! The build completed without errors.');
  console.log('');
  console.log('Your project should now be buildable. If you encounter any further issues,');
  console.log('you may need to run the following commands:');
  console.log('1. npm run typecheck - to check for any remaining type issues');
  console.log('2. npm run lint:fix - to fix any remaining linting issues');
  console.log('3. npm run format - to format the code consistently');
  process.exit(0);
} else {
  console.log('❌ The build still has issues. Here are some recommendations:');
  console.log('');
  console.log('1. Check for any remaining type errors with: npm run typecheck');
  console.log('2. Look at the error messages from the build and fix them manually');
  console.log('3. Consider running: npm run fix:all - to apply all automated fixes');
  process.exit(1);
}
