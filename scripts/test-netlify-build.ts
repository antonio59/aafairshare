#!/usr/bin/env node

/**
 * Test Netlify Build Locally
 * 
 * This script simulates the Netlify build environment locally
 * to test if our build process works before pushing to Netlify.
 */

import { execSync, ExecSyncOptions } from 'child_process';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

interface CommandOptions {
  ignoreError?: boolean;
  silent?: boolean;
}

interface BuildArtifacts {
  dist: string[];
  functions: string[];
}

interface BuildConfig {
  directories: {
    dist: string;
    functions: string;
    playwright: string;
    testResults: string;
  };
  env: Record<string, string>;
}

/**
 * Log a section header
 */
function logSection(message: string): void {
  console.log('\n');
  console.log('='.repeat(80));
  console.log(message);
  console.log('='.repeat(80));
}

/**
 * Run a shell command with proper error handling
 */
function runCommand(command: string, options: CommandOptions = {}): boolean {
  const { ignoreError = false, silent = false } = options;
  
  try {
    if (!silent) {
      console.log(`Running: ${command}`);
    }
    
    const execOptions: ExecSyncOptions = {
      stdio: silent ? 'ignore' : 'inherit',
      env: {
        ...process.env,
        SKIP_TESTS: 'true',
        SKIP_SENTRY: 'true',
        CI: 'true',
        NODE_ENV: 'production'
      }
    };
    
    execSync(command, execOptions);
    return true;
  } catch (error) {
    if (!silent) {
      console.error(`Command failed: ${command}`);
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
    
    if (!ignoreError) {
      throw error;
    }
    
    return false;
  }
}

/**
 * Ensure required directories exist
 */
function ensureDirectories(config: BuildConfig): void {
  Object.values(config.directories).forEach(dir => {
    mkdirSync(dir, { recursive: true });
  });
}

/**
 * Clean previous build artifacts
 */
function cleanBuildArtifacts(config: BuildConfig): void {
  logSection('Cleaning Previous Build Artifacts');
  const cleanCommand = `rm -rf ${Object.values(config.directories).join(' ')}`;
  runCommand(cleanCommand);
}

/**
 * Check build artifacts
 */
function checkBuildArtifacts(config: BuildConfig): BuildArtifacts {
  const artifacts: BuildArtifacts = {
    dist: readdirSync(config.directories.dist),
    functions: readdirSync(config.directories.functions)
  };

  console.log('dist directory contents:', artifacts.dist);
  console.log('netlify/functions-dist directory contents:', artifacts.functions);

  return artifacts;
}

/**
 * Run the build process
 */
async function runBuild(config: BuildConfig): Promise<void> {
  // Install dependencies
  logSection('Installing Dependencies');
  runCommand('npm ci');

  // Build Netlify functions
  logSection('Building Netlify Functions');
  runCommand('npm run build:netlify-functions');

  // Build frontend
  logSection('Building Frontend');
  runCommand('npx vite build');
}

/**
 * Validate build artifacts
 */
function validateBuild(artifacts: BuildArtifacts): boolean {
  return artifacts.dist.length > 0 && artifacts.functions.length > 0;
}

/**
 * Main build simulation function
 */
async function main(): Promise<void> {
  try {
    const config: BuildConfig = {
      directories: {
        dist: 'dist',
        functions: 'netlify/functions-dist',
        playwright: 'playwright-report',
        testResults: 'test-results'
      },
      env: {
        SKIP_TESTS: 'true',
        SKIP_SENTRY: 'true',
        CI: 'true',
        NODE_ENV: 'production'
      }
    };

    logSection('Starting Netlify Build Simulation');

    // Clean and prepare directories
    cleanBuildArtifacts(config);
    ensureDirectories(config);

    // Run build process
    await runBuild(config);

    // Check build artifacts
    logSection('Checking Build Artifacts');
    const artifacts = checkBuildArtifacts(config);

    if (validateBuild(artifacts)) {
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
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the build simulation
main().catch(error => {
  console.error('Unhandled error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
