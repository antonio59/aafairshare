/**
 * CI Build Script
 * 
 * This script handles the CI build process with improved error handling
 * and conditional execution of steps based on environment variables.
 */

import { execSync } from 'child_process';
import { join } from 'path';

function runCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

function logSection(title: string) {
  console.log(`\n=== ${title} ===\n`);
}

async function main() {
  try {
    // Clean previous builds
    logSection('Cleaning');
    runCommand('rm -rf dist');
    runCommand('rm -rf coverage');

    // Install dependencies
    logSection('Installing Dependencies');
    runCommand('npm ci');

    // Type checking
    logSection('Type Checking');
    runCommand('tsc --noEmit');

    // Run tests
    logSection('Running Tests');
    runCommand('npm run test:ci');

    // Build application
    logSection('Building Application');
    runCommand('npm run build');

    console.log('\nBuild completed successfully! 🎉\n');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
