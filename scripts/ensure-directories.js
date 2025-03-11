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

const directories = [
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'netlify/functions-dist'),
  path.join(rootDir, 'playwright-report'),
  path.join(rootDir, 'test-results')
];

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
    // Don't exit with error - let the build continue
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
    console.log(`Created placeholder test results at ${testResultsFile}`);
  } catch (error) {
    console.error('Error creating test results:', error.message);
  }
}

console.log('Directory setup completed successfully'); 