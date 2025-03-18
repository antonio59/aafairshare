#!/usr/bin/env node

/**
 * Performance testing script using Lighthouse directly
 * This replaces the LHCI functionality with a simpler approach
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import lighthouse, { RunnerResult } from 'lighthouse';
type CategoryResult = { score: number | null };
import { launch } from 'chrome-launcher';
type ChromeLauncher = Awaited<ReturnType<typeof launch>>;
import { fileURLToPath } from 'url';

interface LighthouseOptions {
  logLevel: 'info' | 'error' | 'warn' | 'verbose' | 'silent';
  output: 'json' | 'html' | 'csv';
  port: number;
  onlyCategories: string[];
}

interface TestResult {
  score: number;
  reportPath: string;
  categories: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

interface TestConfig {
  urls: string[];
  minimumScore: number;
  outputDir: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Ensure the output directory exists
 */
function ensureOutputDirectory(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Format score for display
 */
function formatScore(score: number): string {
  return score.toFixed(1).padStart(5);
}

/**
 * Extract category scores from Lighthouse results
 */
function extractCategoryScores(categories: Record<string, CategoryResult>): TestResult['categories'] {
  return {
    performance: categories.performance?.score ?? 0,
    accessibility: categories.accessibility?.score ?? 0,
    bestPractices: categories['best-practices']?.score ?? 0,
    seo: categories.seo?.score ?? 0
  };
}

/**
 * Run Lighthouse audit for a single URL
 */
async function runLighthouse(url: string, outputDir: string): Promise<TestResult> {
  let chrome: ChromeLauncher | null = null;
  
  try {
    // Launch Chrome
    chrome = await launch({ 
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] 
    });
    
    // Configure Lighthouse options
    const options: LighthouseOptions = {
      logLevel: 'info',
      output: 'html',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    console.log(`\nRunning Lighthouse for ${url}...`);
    const result = await lighthouse(url, options);
    
    if (!result) {
      throw new Error('Lighthouse audit failed to return results');
    }
    
    const runnerResult: RunnerResult = result;
    
    // Generate report
    const reportHtml = runnerResult.report;
    if (typeof reportHtml !== 'string') {
      throw new Error('Lighthouse report output is not in the expected string format');
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(outputDir, `lighthouse-${timestamp}.html`);
    
    writeFileSync(reportPath, reportHtml);
    
    const categories = extractCategoryScores(runnerResult.lhr.categories);
    const performanceScore = categories.performance * 100;
    
    console.log('\nAudit Results:');
    console.log('-------------');
    console.log(`Performance:     ${formatScore(categories.performance * 100)}%`);
    console.log(`Accessibility:   ${formatScore(categories.accessibility * 100)}%`);
    console.log(`Best Practices: ${formatScore(categories.bestPractices * 100)}%`);
    console.log(`SEO:            ${formatScore(categories.seo * 100)}%`);
    console.log(`\nReport saved to: ${reportPath}`);
    
    return {
      score: performanceScore,
      reportPath,
      categories
    };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): TestConfig {
  const args = process.argv.slice(2);
  let urls = ['http://localhost:5173/']; // Default Vite dev server URL
  let minimumScore = 80;
  const outputDir = join(__dirname, '../lighthouse-reports');
  
  if (args.includes('--help')) {
    console.log(`
    Usage: tsx run-lighthouse.ts [options]
    
    Options:
      --url=<url>       URL to test (default: http://localhost:5173/)
      --threshold=<n>   Minimum performance score (default: 80)
      --help           Show this help
    `);
    process.exit(0);
  }
  
  args.forEach(arg => {
    if (arg.startsWith('--url=')) {
      urls[0] = arg.replace('--url=', '');
    }
    if (arg.startsWith('--threshold=')) {
      const threshold = parseInt(arg.replace('--threshold=', ''), 10);
      if (!isNaN(threshold)) {
        minimumScore = threshold;
      }
    }
  });
  
  return { urls, minimumScore, outputDir };
}

/**
 * Main function to run Lighthouse tests
 */
async function main(): Promise<void> {
  try {
    const config = parseArgs();
    ensureOutputDirectory(config.outputDir);
    
    let failedTests = 0;
    
    for (const url of config.urls) {
      try {
        const result = await runLighthouse(url, config.outputDir);
        
        if (result.score < config.minimumScore) {
          console.error(
            `\n❌ Performance score ${formatScore(result.score)}% is below the minimum threshold of ${config.minimumScore}%`
          );
          failedTests++;
        } else {
          console.log(
            `\n✅ Performance score ${formatScore(result.score)}% passes threshold of ${config.minimumScore}%`
          );
        }
      } catch (error) {
        console.error(`\nError testing ${url}:`, error instanceof Error ? error.message : error);
        failedTests++;
      }
    }
    
    // Exit with error if any tests failed
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\nUnhandled error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  console.error('\nFatal error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
