/**
 * Netlify Setup Directories Plugin
 * 
 * A simple plugin to ensure directories exist before the build process
 */

const fs = require('fs');
const path = require('path');

// Simple directory creation function
function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      // Use recursive option to create parent directories as needed
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
      return true;
    } else {
      console.log(`Directory exists: ${dir}`);
      return true;
    }
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error.message);
    return false;
  }
}

// Plugin definition - this format is required by Netlify
module.exports = {
  onPreBuild: ({ utils }) => {
    console.log('Setting up required directories...');
    
    // Create required directories
    const dirs = [
      'dist',
      'netlify/functions-dist',
      'playwright-report',
      'test-results'
    ];
    
    // Create each directory
    dirs.forEach(dir => {
      ensureDir(dir);
    });
    
    // Create placeholder test files
    try {
      if (!fs.existsSync('playwright-report/index.html')) {
        fs.writeFileSync(
          'playwright-report/index.html',
          '<html><body><h1>Tests skipped</h1></body></html>'
        );
      }
      
      if (!fs.existsSync('test-results/results.json')) {
        fs.writeFileSync(
          'test-results/results.json',
          JSON.stringify({ skipped: true, timestamp: new Date().toISOString() })
        );
      }
    } catch (error) {
      console.error('Error creating placeholder files:', error.message);
      // Continue despite errors
    }
    
    console.log('Directory setup completed');
  }
}; 