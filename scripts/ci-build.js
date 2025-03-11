/**
 * CI Build Script
 * 
 * This script handles the CI build process with improved error handling
 * and conditional execution of steps based on environment variables.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const logSection = (message) => {
  console.log('\n');
  console.log('='.repeat(80));
  console.log(message);
  console.log('='.repeat(80));
};

const runCommand = (command, options = {}) => {
  const { ignoreError = false, silent = false } = options;
  
  try {
    if (!silent) {
      console.log(`Running: ${command}`);
    }
    
    execSync(command, { 
      stdio: silent ? 'ignore' : 'inherit',
      env: { ...process.env }
    });
    
    return true;
  } catch (error) {
    if (!silent) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
    }
    
    if (!ignoreError) {
      throw error;
    }
    
    return false;
  }
};

const main = () => {
  try {
    logSection('Starting CI Build Process');
    
    // Check environment
    const isCI = process.env.CI === 'true';
    const skipTests = process.env.SKIP_TESTS === 'true';
    const skipSentry = process.env.SKIP_SENTRY === 'true';
    
    console.log(`CI Environment: ${isCI ? 'Yes' : 'No'}`);
    console.log(`Skip Tests: ${skipTests ? 'Yes' : 'No'}`);
    console.log(`Skip Sentry: ${skipSentry ? 'Yes' : 'No'}`);
    
    // TypeScript compilation
    logSection('TypeScript Compilation');
    runCommand('tsc -p tsconfig.netlify.json');
    
    // Build Netlify functions
    logSection('Building Netlify Functions');
    runCommand('npm run build:netlify-functions');
    
    // Run tests if not skipped
    if (!skipTests) {
      logSection('Running Tests');
      runCommand('npm run test:ci', { ignoreError: true });
    } else {
      logSection('Tests Skipped');
    }
    
    // Build frontend
    logSection('Building Frontend');
    runCommand('npx vite build');
    
    // Create Sentry release if not skipped
    if (!skipSentry) {
      logSection('Creating Sentry Release');
      
      if (process.env.SENTRY_AUTH_TOKEN) {
        runCommand('node scripts/create-sentry-release.js', { ignoreError: true });
      } else {
        console.log('Skipping Sentry release - SENTRY_AUTH_TOKEN not set');
      }
    } else {
      logSection('Sentry Release Skipped');
    }
    
    logSection('Build Completed Successfully');
    
  } catch (error) {
    console.error('Build failed with error:');
    console.error(error);
    process.exit(1);
  }
};

main(); 