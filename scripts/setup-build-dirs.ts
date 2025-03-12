#!/usr/bin/env node

/**
 * Setup Build Directories
 * 
 * A pure Node.js implementation for creating required build directories
 * without relying on shell commands. This ensures cross-platform compatibility
 * and works in all build environments.
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface DirectorySetup {
  path: string;
  description: string;
  placeholderFile?: {
    name: string;
    content: string;
  };
}

// Define required directories and their placeholder files
const directories: DirectorySetup[] = [
  { 
    path: 'dist',
    description: 'Build output directory'
  },
  { 
    path: 'netlify/functions-dist',
    description: 'Netlify Functions build directory'
  },
  { 
    path: 'playwright-report',
    description: 'Playwright test reports',
    placeholderFile: {
      name: 'index.html',
      content: '<html><body><h1>Tests skipped</h1></body></html>'
    }
  },
  { 
    path: 'test-results',
    description: 'Test results directory',
    placeholderFile: {
      name: 'results.json',
      content: JSON.stringify({ skipped: true, timestamp: new Date().toISOString() })
    }
  }
];

async function setupBuildDirectories(): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (const dir of directories) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const fullPath = join(process.cwd(), dir.path);
        
        // Create directory if it doesn't exist
        if (!existsSync(fullPath)) {
          await mkdir(fullPath, { recursive: true });
          console.log(`✅ Created ${dir.path} (${dir.description})`);
        } else {
          console.log(`ℹ️ ${dir.path} already exists`);
        }

        // Create placeholder file if specified
        if (dir.placeholderFile) {
          const filePath = join(fullPath, dir.placeholderFile.name);
          if (!existsSync(filePath)) {
            await writeFile(filePath, dir.placeholderFile.content);
            console.log(`✅ Created placeholder file: ${filePath}`);
          }
        }

        break;
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) {
          console.error(`❌ Failed to setup ${dir.path} after ${maxRetries} attempts`);
          throw error;
        }
        console.log(`Retrying setup of ${dir.path} (attempt ${attempts}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.log('\n🎉 Build directory setup completed successfully');
}

// Run the directory setup
setupBuildDirectories().catch(error => {
  console.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});