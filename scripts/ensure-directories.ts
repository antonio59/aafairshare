/**
 * Ensure Required Directories
 * 
 * This script ensures that all directories required for the build process
 * exist before starting the build. It uses Node.js fs module instead of 
 * shell commands to maximize compatibility with all environments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface DirectoryResult {
  path: string;
  created: boolean;
  error?: string;
}

const directories: string[] = [
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'netlify/functions-dist'),
  path.join(rootDir, 'playwright-report'),
  path.join(rootDir, 'test-results')
];

console.log('Ensuring required directories exist...');

const results: DirectoryResult[] = directories.map(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
      return { path: dir, created: true };
    } else {
      console.log(`Directory already exists: ${dir}`);
      return { path: dir, created: false };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error creating directory ${dir}:`, errorMessage);
    return { path: dir, created: false, error: errorMessage };
  }
});

// Create placeholder files for Playwright if needed
const playwrightReportFile = path.join(rootDir, 'playwright-report', 'index.html');
if (!fs.existsSync(playwrightReportFile)) {
  try {
    fs.writeFileSync(
      playwrightReportFile,
      '<html><body><h1>Playwright tests were skipped</h1></body></html>'
    );
    console.log(`Created placeholder Playwright report at ${playwrightReportFile}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating Playwright report:', errorMessage);
  }
}

const testResultsFile = path.join(rootDir, 'test-results', 'results.json');
if (!fs.existsSync(testResultsFile)) {
  try {
    fs.writeFileSync(
      testResultsFile,
      JSON.stringify({ skipped: true, timestamp: new Date().toISOString() })
    );
    console.log(`Created placeholder test results at ${testResultsFile}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating test results:', errorMessage);
  }
}

// Print summary
console.log('\nDirectory setup summary:');
results.forEach(result => {
  if (result.error) {
    console.log(`- ${result.path}: ❌ (Error: ${result.error})`);
  } else if (result.created) {
    console.log(`- ${result.path}: ✅ (Created)`);
  } else {
    console.log(`- ${result.path}: ✅ (Already exists)`);
  }
});

console.log('\nDirectory setup completed successfully'); 