/**
 * Netlify Pure Build Script
 * 
 * A pure TypeScript build script for Netlify that doesn't rely on any shell commands.
 * Following Netlify best practices as documented.
 */

// Use standard Node.js modules with ES module syntax
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync, SpawnSyncOptions, SpawnSyncReturns } from 'child_process';
import { promisify } from 'util';

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Convert necessary functions to promises
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const exists = (filePath: string): boolean => fs.existsSync(filePath);

// Project directories needed for build
const REQUIRED_DIRS: string[] = [
  'dist',
  'netlify/functions-dist',
  'playwright-report',
  'test-results'
];

interface BuildResult {
  success: boolean;
  message?: string;
}

/**
 * Ensure required directories exist
 */
async function ensureDirectories(): Promise<BuildResult> {
  console.log('Ensuring required directories exist...');
  
  const failures: string[] = [];
  
  for (const dir of REQUIRED_DIRS) {
    try {
      const dirPath = path.join(rootDir, dir);
      if (!exists(dirPath)) {
        await mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      } else {
        console.log(`Directory exists: ${dirPath}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error creating directory ${dir}:`, errorMessage);
      failures.push(dir);
      // Continue with other directories even if one fails
    }
  }
  
  // Create placeholder test files to avoid artifact upload errors
  try {
    const playwrightReportFile = path.join(rootDir, 'playwright-report', 'index.html');
    if (!exists(playwrightReportFile)) {
      await writeFile(
        playwrightReportFile,
        '<html><body><h1>Tests skipped</h1></body></html>'
      );
      console.log(`Created playwright report: ${playwrightReportFile}`);
    }
    
    const testResultsFile = path.join(rootDir, 'test-results', 'results.json');
    if (!exists(testResultsFile)) {
      await writeFile(
        testResultsFile,
        JSON.stringify({ skipped: true, timestamp: new Date().toISOString() })
      );
      console.log(`Created test results: ${testResultsFile}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating placeholder files:', errorMessage);
    failures.push('placeholder files');
  }
  
  if (failures.length > 0) {
    return {
      success: false,
      message: `Failed to create the following: ${failures.join(', ')}`
    };
  }
  
  return { success: true };
}

/**
 * Run a command safely without shell
 */
function run(command: string, args: string[]): BuildResult {
  console.log(`Running: ${command} ${args.join(' ')}`);
  
  // Use spawnSync to run command directly without shell
  const options: SpawnSyncOptions = {
    stdio: 'inherit',
    env: process.env,
    cwd: rootDir
  };
  
  // Fix the type to allow string | Buffer
  const result = spawnSync(command, args, options);
  
  if (result.error) {
    return {
      success: false,
      message: `Error running command: ${result.error.message}`
    };
  }
  
  if (result.status !== 0) {
    return {
      success: false,
      message: `Command failed with status: ${result.status}`
    };
  }
  
  return { success: true };
}

/**
 * Main build process
 */
async function main(): Promise<void> {
  try {
    console.log('Starting Netlify build...');
    
    // 1. Ensure directories exist
    const dirsResult = await ensureDirectories();
    if (!dirsResult.success) {
      console.warn(`Warning: Some directories could not be created: ${dirsResult.message}`);
      // Continue with build process despite directory creation issues
    }
    
    // 2. Compile TypeScript for Netlify functions
    console.log('Compiling TypeScript for Netlify functions...');
    const tsResult = run('npx', ['tsc', '-p', 'tsconfig.netlify.json']);
    if (!tsResult.success) {
      console.error(`Failed to compile TypeScript: ${tsResult.message}`);
      process.exit(1);
    }
    
    // 3. Build frontend
    console.log('Building frontend...');
    const buildResult = run('npx', ['vite', 'build']);
    if (!buildResult.success) {
      console.error(`Failed to build frontend: ${buildResult.message}`);
      process.exit(1);
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Build failed:', errorMessage);
    process.exit(1);
  }
}

// Run the build process
main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Unhandled error:', errorMessage);
  process.exit(1);
}); 