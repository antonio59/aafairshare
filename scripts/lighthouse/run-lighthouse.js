#!/usr/bin/env node

/**
 * Local Lighthouse Performance Testing Script
 * 
 * This script runs Lighthouse tests against a locally running version of the application.
 * It generates HTML reports and performance metrics for analysis.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

// Configuration
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const PAGES_TO_TEST = [
  '/',                  // Home page
  '/dashboard',         // Dashboard
  '/expenses',          // Expenses list
  '/settlements',       // Settlements list
  '/settings',          // Settings page
  '/test-pages'         // Test pages for visual regression
];
const REPORT_DIR = path.join(process.cwd(), 'lighthouse-reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  console.log(`Created directory: ${REPORT_DIR}`);
}

// Ensure we have a timestamp for this run
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runDir = path.join(REPORT_DIR, timestamp);
fs.mkdirSync(runDir, { recursive: true });

// Function to sanitize URL for filename
const sanitizeUrl = (url) => {
  return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

// Function to run Lighthouse
const runLighthouse = (url) => {
  console.log(`Running Lighthouse for: ${url}`);
  
  const sanitizedUrl = sanitizeUrl(url);
  const reportPath = path.join(runDir, `${sanitizedUrl}.html`);
  const jsonPath = path.join(runDir, `${sanitizedUrl}.json`);
  
  try {
    const command = [
      'lighthouse',
      `"${url}"`,
      '--output=html,json',
      `--output-path="${reportPath}"`,
      '--chrome-flags="--headless --no-sandbox --disable-gpu"',
      '--preset=desktop'
    ].join(' ');
    
    execSync(command, { stdio: 'inherit' });
    
    // Rename JSON file (lighthouse adds .report.json)
    if (fs.existsSync(`${reportPath}.report.json`)) {
      fs.renameSync(`${reportPath}.report.json`, jsonPath);
    }
    
    console.log(`Report saved to: ${reportPath}`);
    
    // Parse the JSON report to extract key metrics
    const jsonReport = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const metrics = {
      performance: jsonReport.categories.performance.score * 100,
      accessibility: jsonReport.categories.accessibility.score * 100,
      bestPractices: jsonReport.categories['best-practices'].score * 100,
      seo: jsonReport.categories.seo.score * 100,
      firstContentfulPaint: jsonReport.audits['first-contentful-paint'].displayValue,
      largestContentfulPaint: jsonReport.audits['largest-contentful-paint'].displayValue,
      totalBlockingTime: jsonReport.audits['total-blocking-time'].displayValue,
      cumulativeLayoutShift: jsonReport.audits['cumulative-layout-shift'].displayValue,
    };
    
    return metrics;
  } catch (error) {
    console.error(`Error running Lighthouse for ${url}:`, error.message);
    return null;
  }
};

// Check if the server is running
const checkServerRunning = () => {
  try {
    execSync(`curl -s ${BASE_URL} > /dev/null`);
    return true;
  } catch (error) {
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('Starting Lighthouse performance tests...');
  
  if (!checkServerRunning()) {
    console.error(`Error: Server not running at ${BASE_URL}`);
    console.log('Please start the server before running Lighthouse tests.');
    exit(1);
  }
  
  // Create a summary file
  const summaryPath = path.join(runDir, 'summary.md');
  fs.writeFileSync(summaryPath, `# Lighthouse Performance Test Results\n\nRun at: ${new Date().toISOString()}\n\n`);
  fs.appendFileSync(summaryPath, '| Page | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |\n');
  fs.appendFileSync(summaryPath, '| ---- | ---------- | ------------ | -------------- | --- | --- | --- | --- | --- |\n');
  
  // Run tests for each page
  for (const page of PAGES_TO_TEST) {
    const url = `${BASE_URL}${page}`;
    const metrics = runLighthouse(url);
    
    if (metrics) {
      // Add results to summary
      fs.appendFileSync(
        summaryPath,
        `| ${page} | ${metrics.performance.toFixed(0)} | ${metrics.accessibility.toFixed(0)} | ${metrics.bestPractices.toFixed(0)} | ${metrics.seo.toFixed(0)} | ${metrics.firstContentfulPaint} | ${metrics.largestContentfulPaint} | ${metrics.totalBlockingTime} | ${metrics.cumulativeLayoutShift} |\n`
      );
    } else {
      fs.appendFileSync(summaryPath, `| ${page} | Error | Error | Error | Error | Error | Error | Error | Error |\n`);
    }
  }
  
  console.log(`\nLighthouse tests completed. Summary saved to: ${summaryPath}`);
};

main().catch((error) => {
  console.error('Error running Lighthouse tests:', error);
  exit(1);
});
