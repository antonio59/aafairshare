#!/usr/bin/env node

/**
 * Debug Environment Script
 * 
 * This script helps diagnose build issues by printing
 * relevant environment information.
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync, SpawnSyncReturns } from 'child_process';

interface DirectoryCheck {
  path: string;
  exists: boolean;
  contents?: string[];
  error?: string;
}

interface CommandCheck {
  name: string;
  path?: string;
  exists: boolean;
  error?: string;
}

/**
 * Print environment variables excluding sensitive ones
 */
function printEnvironmentVariables(): void {
  console.log('\n=== ENVIRONMENT VARIABLES ===');
  Object.keys(process.env)
    .filter(key => !key.toLowerCase().includes('token') && 
                  !key.toLowerCase().includes('secret') && 
                  !key.toLowerCase().includes('key'))
    .sort()
    .forEach(key => {
      console.log(`${key}=${process.env[key]}`);
    });
}

/**
 * Check directory existence and contents
 */
function checkDirectory(dir: string): DirectoryCheck {
  try {
    const exists = existsSync(dir);
    if (!exists) {
      return { path: dir, exists: false };
    }

    try {
      const contents = readdirSync(dir).slice(0, 5);
      return { path: dir, exists: true, contents };
    } catch (error) {
      return {
        path: dir,
        exists: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } catch (error) {
    return {
      path: dir,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Print directory check results
 */
function printDirectoryCheck(check: DirectoryCheck): void {
  if (!check.exists) {
    console.log(`❌ ${check.path} does not exist${check.error ? `: ${check.error}` : ''}`);
    return;
  }

  console.log(`✅ ${check.path} exists`);
  if (check.contents) {
    console.log(
      `   Contents (first 5): ${check.contents.join(', ')}${
        check.contents.length >= 5 ? '...' : ''
      }`
    );
  } else if (check.error) {
    console.log(`   Cannot read contents: ${check.error}`);
  }
}

/**
 * Check command availability
 */
function checkCommand(cmd: string): CommandCheck {
  try {
    const result: SpawnSyncReturns<string> = spawnSync('which', [cmd], { 
      encoding: 'utf8' 
    });
    
    if (result.status === 0) {
      return {
        name: cmd,
        path: result.stdout.trim(),
        exists: true
      };
    }
    
    return {
      name: cmd,
      exists: false
    };
  } catch (error) {
    return {
      name: cmd,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Print command check results
 */
function printCommandCheck(check: CommandCheck): void {
  if (check.exists && check.path) {
    console.log(`✅ ${check.name} found at ${check.path}`);
  } else if (check.error) {
    console.log(`❌ Error checking ${check.name}: ${check.error}`);
  } else {
    console.log(`❌ ${check.name} not found`);
  }
}

/**
 * Main debug function
 */
function debugEnvironment(): void {
  console.log('=== ENVIRONMENT DEBUG INFO ===');

  // Print Node.js information
  console.log(`Node.js version: ${process.version}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Platform: ${process.platform}`);

  // Print environment variables
  printEnvironmentVariables();

  // Check directories
  console.log('\n=== DIRECTORY CHECKS ===');
  const dirsToCheck = [
    '/',
    '/bin',
    '/usr/bin',
    '/usr/local/bin',
    process.cwd(),
    join(process.cwd(), 'node_modules'),
    join(process.cwd(), 'dist')
  ];

  dirsToCheck
    .map(checkDirectory)
    .forEach(printDirectoryCheck);

  // Check commands
  console.log('\n=== COMMAND CHECKS ===');
  const commandsToCheck = [
    'node',
    'npm',
    'mkdir',
    'ls',
    'touch',
    'cat',
    'which'
  ];

  commandsToCheck
    .map(checkCommand)
    .forEach(printCommandCheck);

  console.log('\n=== END DEBUG INFO ===');
}

// Run the debug script
debugEnvironment();
