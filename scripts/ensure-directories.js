/**
 * Ensure Required Directories
 * 
 * This script ensures that all directories required for the build process
 * exist before starting the build. It uses Node.js fs module instead of 
 * shell commands to maximize compatibility with all environments.
 */

const fs = require('fs');
const path = require('path');

const directories = [
  'dist',
  'netlify/functions-dist',
  'playwright-report',
  'test-results'
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
if (!fs.existsSync(path.join('playwright-report', 'index.html'))) {
  try {
    fs.writeFileSync(
      path.join('playwright-report', 'index.html'),
      '<html><body><h1>Playwright tests were skipped</h1></body></html>'
    );
    console.log('Created placeholder Playwright report');
  } catch (error) {
    console.error('Error creating Playwright report:', error.message);
  }
}

if (!fs.existsSync(path.join('test-results', 'results.json'))) {
  try {
    fs.writeFileSync(
      path.join('test-results', 'results.json'),
      JSON.stringify({ skipped: true, timestamp: new Date().toISOString() })
    );
    console.log('Created placeholder test results');
  } catch (error) {
    console.error('Error creating test results:', error.message);
  }
}

console.log('Directory setup completed successfully'); 