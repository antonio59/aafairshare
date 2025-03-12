#!/usr/bin/env node

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

interface DirectoryConfig {
  path: string;
  description: string;
}

const directories: DirectoryConfig[] = [
  { path: 'dist', description: 'Build output directory' },
  { path: 'netlify/functions-dist', description: 'Netlify Functions build directory' },
  { path: 'playwright-report', description: 'Playwright test reports' },
  { path: 'test-results', description: 'Test results directory' },
  { path: 'coverage', description: 'Test coverage reports' }
];

async function ensureDirectories(): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (const dir of directories) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const fullPath = join(process.cwd(), dir.path);
        
        if (!existsSync(fullPath)) {
          await mkdir(fullPath, { recursive: true });
          console.log(`✅ Created ${dir.path} (${dir.description})`);
          break;
        } else {
          console.log(`ℹ️ ${dir.path} already exists`);
          break;
        }
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) {
          throw error;
        }
        console.log(`Retrying creation of ${dir.path} (attempt ${attempts}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
    
    // Create .keep file in Netlify Functions directory
    const netlifyFunctionsDir = join(process.cwd(), 'netlify/functions-dist');
    const keepFilePath = join(netlifyFunctionsDir, '.keep');
    
    if (!existsSync(keepFilePath)) {
      await mkdir(netlifyFunctionsDir, { recursive: true });
      await writeFile(keepFilePath, '', { encoding: 'utf-8' });
      console.log('✅ Created .keep file in Netlify Functions directory');
    }
    
    console.log('\n🎉 Directory setup completed successfully');
  } catch (error) {
    const errorMessage = toErrorWithMessage(error).message;
    console.error('❌ Error creating directories:', errorMessage);
    process.exit(1);
  }
}

// Run the directory creation
ensureDirectories().catch(error => {
  const errorMessage = toErrorWithMessage(error).message;
  console.error('❌ Unhandled error:', errorMessage);
  process.exit(1);
});
