#!/usr/bin/env node

/**
 * Netlify Build Script
 * 
 * This script orchestrates the entire Netlify build process using only
 * Node.js APIs, avoiding any shell commands like mkdir or touch that
 * might not be available in the build environment.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync, SpawnSyncOptions, SpawnSyncReturns } from 'child_process';

interface BuildDirectories {
  dist: string;
  functions: string;
  playwright: string;
  testResults: string;
}

interface CommandResult {
  success: boolean;
  error?: string;
}

interface PlaceholderFiles {
  playwrightReport: string;
  testResults: string;
}

interface BuildConfig {
  directories: BuildDirectories;
  placeholderFiles: PlaceholderFiles;
  env: Record<string, string>;
}

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Initialize build configuration
const config: BuildConfig = {
  directories: {
    dist: join(rootDir, 'dist'),
    functions: join(rootDir, 'netlify/functions-dist'),
    playwright: join(rootDir, 'playwright-report'),
    testResults: join(rootDir, 'test-results')
  },
  placeholderFiles: {
    playwrightReport: join(rootDir, 'playwright-report', 'index.html'),
    testResults: join(rootDir, 'test-results', 'results.json')
  },
  env: {
    ...process.env,
    SKIP_NODE_CHECK: 'true',
    NODE_ENV: 'production'
  }
};

/**
 * Runs a command and returns the result
 * Uses Node.js spawnSync instead of shell commands
 */
function runCommand(
  command: string,
  args: string[],
  options: Partial<SpawnSyncOptions> = {}
): CommandResult {
  console.log(`Running: ${command} ${args.join(' ')}`);
  
  try {
    const result = spawnSync(command, args, {
      stdio: 'inherit',
      shell: false, // Don't use shell to avoid shell command issues
      cwd: rootDir,
      env: config.env,
      ...options
    });
    
    if (result.error) {
      return {
        success: false,
        error: result.error instanceof Error ? result.error.message : 'Unknown error'
      };
    }
    
    if (result.status !== 0) {
      return {
        success: false,
        error: `Command exited with code ${result.status}`
      };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Creates a directory if it doesn't exist
 */
function createDirectory(dir: string): CommandResult {
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Creates placeholder files for test reports
 */
function createPlaceholderFiles(): CommandResult {
  try {
    // Create Playwright report placeholder
    if (!existsSync(config.placeholderFiles.playwrightReport)) {
      writeFileSync(
        config.placeholderFiles.playwrightReport,
        '<html><body><h1>Playwright tests were skipped</h1></body></html>'
      );
      console.log(`Created placeholder Playwright report: ${config.placeholderFiles.playwrightReport}`);
    }
    
    // Create test results placeholder
    if (!existsSync(config.placeholderFiles.testResults)) {
      writeFileSync(
        config.placeholderFiles.testResults,
        JSON.stringify({
          skipped: true,
          timestamp: new Date().toISOString()
        })
      );
      console.log(`Created placeholder test results: ${config.placeholderFiles.testResults}`);
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Ensures all required directories exist
 */
function ensureDirectories(): CommandResult {
  console.log('Ensuring required directories exist...');
  
  for (const [name, dir] of Object.entries(config.directories)) {
    const result = createDirectory(dir);
    if (!result.success) {
      return {
        success: false,
        error: `Failed to create ${name} directory: ${result.error}`
      };
    }
  }
  
  return createPlaceholderFiles();
}

/**
 * Install dependencies using npm ci
 */
function installDependencies(): CommandResult {
  console.log('Installing dependencies...');
  return runCommand('npm', ['ci']);
}

/**
 * Compile TypeScript files for Netlify functions
 */
function compileTypeScript(): CommandResult {
  console.log('Compiling TypeScript for Netlify functions...');
  return runCommand('npx', ['tsc', '-p', 'tsconfig.netlify.json']);
}

/**
 * Build the frontend application
 */
function buildFrontend(): CommandResult {
  console.log('Building frontend application...');
  return runCommand('npx', ['vite', 'build']);
}

/**
 * Main build process
 */
async function main(): Promise<void> {
  try {
    console.log('Starting Netlify build process...');
    
    // Step 1: Ensure directories exist
    const dirsResult = ensureDirectories();
    if (!dirsResult.success) {
      throw new Error(`Directory setup failed: ${dirsResult.error}`);
    }
    
    // Step 2: Install dependencies
    const depsResult = installDependencies();
    if (!depsResult.success) {
      console.warn(`Warning: Dependencies installation had issues: ${depsResult.error}`);
      // Continue despite npm ci issues as some dependencies might be cached
    }
    
    // Step 3: Compile TypeScript
    const tsResult = compileTypeScript();
    if (!tsResult.success) {
      throw new Error(`TypeScript compilation failed: ${tsResult.error}`);
    }
    
    // Step 4: Build the frontend
    const frontendResult = buildFrontend();
    if (!frontendResult.success) {
      throw new Error(`Frontend build failed: ${frontendResult.error}`);
    }
    
    console.log('Build completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the build process
main().catch(error => {
  console.error('Unhandled error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
