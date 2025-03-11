/**
 * Netlify Build Script
 * 
 * This script orchestrates the entire Netlify build process using only
 * Node.js APIs, avoiding any shell commands like mkdir or touch that
 * might not be available in the build environment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define required directories
const directories = [
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'netlify/functions-dist'),
  path.join(rootDir, 'playwright-report'),
  path.join(rootDir, 'test-results')
];

/**
 * Runs a command and returns the result
 * Uses Node.js spawnSync instead of shell commands
 */
function runCommand(command, args, options = {}) {
  console.log(`Running: ${command} ${args.join(' ')}`);
  
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false, // Don't use shell to avoid shell command issues
    cwd: rootDir,
    env: { ...process.env, SKIP_NODE_CHECK: 'true' },
    ...options
  });
  
  if (result.error) {
    console.error(`Command error: ${result.error.message}`);
    return false;
  }
  
  if (result.status !== 0) {
    console.error(`Command exited with code ${result.status}`);
    return false;
  }
  
  return true;
}

/**
 * Ensures the required directories exist
 */
function ensureDirectories() {
  console.log('Ensuring required directories exist...');
  
  directories.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } else {
        console.log(`Directory already exists: ${dir}`);
      }
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error.message);
    }
  });
  
  // Create placeholder files for Playwright reports
  const playwrightReportFile = path.join(rootDir, 'playwright-report', 'index.html');
  if (!fs.existsSync(playwrightReportFile)) {
    try {
      fs.writeFileSync(
        playwrightReportFile,
        '<html><body><h1>Playwright tests were skipped</h1></body></html>'
      );
      console.log(`Created placeholder Playwright report: ${playwrightReportFile}`);
    } catch (error) {
      console.error('Error creating Playwright report:', error.message);
    }
  }
  
  const testResultsFile = path.join(rootDir, 'test-results', 'results.json');
  if (!fs.existsSync(testResultsFile)) {
    try {
      fs.writeFileSync(
        testResultsFile,
        JSON.stringify({ skipped: true, timestamp: new Date().toISOString() })
      );
      console.log(`Created placeholder test results: ${testResultsFile}`);
    } catch (error) {
      console.error('Error creating test results:', error.message);
    }
  }
}

/**
 * Install dependencies using npm ci
 */
function installDependencies() {
  console.log('Installing dependencies...');
  return runCommand('npm', ['ci']);
}

/**
 * Compile TypeScript files for Netlify functions
 */
function compileTypeScript() {
  console.log('Compiling TypeScript for Netlify functions...');
  return runCommand('npx', ['tsc', '-p', 'tsconfig.netlify.json']);
}

/**
 * Build the frontend application
 */
function buildFrontend() {
  console.log('Building frontend application...');
  return runCommand('npx', ['vite', 'build']);
}

/**
 * Main build process
 */
async function main() {
  try {
    console.log('Starting Netlify build process...');
    
    // Step 1: Ensure directories exist
    ensureDirectories();
    
    // Step 2: Install dependencies
    const depsInstalled = installDependencies();
    if (!depsInstalled) {
      console.warn('Warning: Dependencies installation had issues but continuing...');
    }
    
    // Step 3: Compile TypeScript
    const tsCompiled = compileTypeScript();
    if (!tsCompiled) {
      console.error('Error: TypeScript compilation failed');
      process.exit(1);
    }
    
    // Step 4: Build the frontend
    const frontendBuilt = buildFrontend();
    if (!frontendBuilt) {
      console.error('Error: Frontend build failed');
      process.exit(1);
    }
    
    console.log('Build completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Build failed with error:', error);
    process.exit(1);
  }
}

// Run the build process
main(); 