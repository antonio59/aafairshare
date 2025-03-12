#!/usr/bin/env node

/**
 * Setup Build Directories
 * 
 * A pure Node.js implementation for creating required build directories
 * without relying on shell commands. This ensures cross-platform compatibility
 * and works in all build environments.
 */

import { mkdir } from 'fs/promises';
import { join } from 'path';

interface BuildDirectory {
  path: string;
  description: string;
}

const BUILD_DIRECTORIES: BuildDirectory[] = [
  {
    path: 'dist',
    description: 'Main build output directory'
  },
  {
    path: 'coverage',
    description: 'Test coverage reports'
  },
  {
    path: 'playwright-report',
    description: 'Playwright test reports'
  },
  {
    path: 'test-results',
    description: 'Test results output'
  }
];

async function createDirectory(dir: BuildDirectory) {
  try {
    await mkdir(join(process.cwd(), dir.path), { recursive: true });
    console.log(`✓ Created ${dir.description}: ${dir.path}`);
  } catch (error) {
    console.error(`✗ Failed to create ${dir.path}:`, error);
  }
}

async function main() {
  console.log('Setting up build directories...\n');
  
  await Promise.all(BUILD_DIRECTORIES.map(createDirectory));
  
  console.log('\nDirectory setup complete! 🎉\n');
}

main().catch(console.error);