#!/usr/bin/env node

/**
 * Performance testing script using Lighthouse directly
 * This replaces the LHCI functionality with a simpler approach
 */

import fs from 'fs';
import path from 'path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = path.join(__dirname, '../lighthouse-reports');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runLighthouse(url) {
  // Launch Chrome
  const chrome = await launch({ chromeFlags: ['--headless'] });
  
  // Run Lighthouse
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };

  console.log(`Running Lighthouse for ${url}...`);
  const runnerResult = await lighthouse(url, options);
  
  // Generate report
  const reportHtml = runnerResult.report;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(outputDir, `lighthouse-${timestamp}.html`);
  
  fs.writeFileSync(reportPath, reportHtml);
  
  console.log('Report is done for', runnerResult.lhr.finalUrl);
  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  console.log('Report saved to:', reportPath);
  
  // Close Chrome
  await chrome.kill();
  
  return {
    score: runnerResult.lhr.categories.performance.score * 100,
    reportPath
  };
}

// URLs to test - modify as needed
const urls = [
  'http://localhost:5173/' // Default Vite dev server URL
];

// Set a minimum score threshold
const MINIMUM_SCORE = 80;

async function main() {
  let failedTests = 0;
  
  for (const url of urls) {
    try {
      const result = await runLighthouse(url);
      
      if (result.score < MINIMUM_SCORE) {
        console.error(`❌ Performance score ${result.score} is below the minimum threshold of ${MINIMUM_SCORE}`);
        failedTests++;
      } else {
        console.log(`✅ Performance score ${result.score} passes threshold of ${MINIMUM_SCORE}`);
      }
    } catch (error) {
      console.error(`Error testing ${url}:`, error);
      failedTests++;
    }
  }
  
  // Exit with error if any tests failed
  process.exit(failedTests > 0 ? 1 : 0);
}

// Check if server is running
if (process.argv.includes('--help')) {
  console.log(`
  Usage: node run-lighthouse.js [options]
  
  Options:
    --url=<url>       URL to test (default: http://localhost:5173/)
    --threshold=<n>   Minimum performance score (default: 80)
    --help            Show this help
  `);
  process.exit(0);
}

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--url=')) {
    urls[0] = arg.replace('--url=', '');
  }
  if (arg.startsWith('--threshold=')) {
    const threshold = parseInt(arg.replace('--threshold=', ''), 10);
    if (!isNaN(threshold)) {
      MINIMUM_SCORE = threshold;
    }
  }
});

main(); 