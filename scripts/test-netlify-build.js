/**
 * Test Netlify Build Locally
 * 
 * This script simulates the Netlify build environment locally
 * to test if our build process works before pushing to Netlify.
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
      env: { ...process.env, SKIP_TESTS: 'true', SKIP_SENTRY: 'true', CI: 'true' }
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
    logSection('Starting Netlify Build Simulation');
    
    // Clean previous build artifacts
    logSection('Cleaning Previous Build Artifacts');
    runCommand('rm -rf dist playwright-report test-results netlify/functions-dist');
    
    // Ensure directories exist
    fs.mkdirSync('dist', { recursive: true });
    fs.mkdirSync('playwright-report', { recursive: true });
    fs.mkdirSync('test-results', { recursive: true });
    fs.mkdirSync('netlify/functions-dist', { recursive: true });
    
    // Simulate Netlify build command
    logSection('Simulating Netlify Build Command');
    
    runCommand('npm ci');
    runCommand('npm run build:netlify-functions');
    runCommand('npx vite build');
    
    // Check if build artifacts were created
    logSection('Checking Build Artifacts');
    
    const distContents = fs.readdirSync('dist');
    console.log('dist directory contents:', distContents);
    
    const functionsDistContents = fs.readdirSync('netlify/functions-dist');
    console.log('netlify/functions-dist directory contents:', functionsDistContents);
    
    if (distContents.length > 0 && functionsDistContents.length > 0) {
      logSection('Build Simulation Successful!');
      console.log('The build process completed successfully and generated expected artifacts.');
      console.log('You can now push these changes to Netlify with confidence.');
    } else {
      logSection('Build Simulation Failed!');
      console.error('The build process did not generate the expected artifacts.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Build simulation failed with error:');
    console.error(error);
    process.exit(1);
  }
};

main(); 