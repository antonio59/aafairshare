#!/usr/bin/env node
/**
 * Client Component Analysis Script
 * 
 * This script analyzes client components for React 19 optimization opportunities:
 * - Identifies excessive useState/useEffect usage
 * - Detects missing Suspense boundaries
 * - Suggests optimization opportunities
 * 
 * Run with: node scripts/analyze-client-components.js
 */

const fs = require('fs');
const path = require('path');

// Directories to analyze
const DIRS_TO_ANALYZE = [
  path.resolve(__dirname, '../src/components/client'),
  path.resolve(__dirname, '../src/app'),
  path.resolve(__dirname, '../src/components')
];

// Component analysis results
const results = {
  clientComponents: 0,
  excessiveStateComponents: 0,
  excessiveEffectComponents: 0,
  missingSuspenseBoundaries: 0,
  optimizationOpportunities: []
};

// Analyze a component file for optimization opportunities
const analyzeComponentFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Skip if not a client component
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      return;
    }
    
    results.clientComponents++;
    
    // Check for excessive useState usage
    const useStateMatches = content.match(/useState\(/g) || [];
    if (useStateMatches.length > 3) {
      results.excessiveStateComponents++;
      results.optimizationOpportunities.push({
        file: filePath,
        issue: 'Excessive useState',
        count: useStateMatches.length,
        suggestion: 'Consider consolidating related state or using useReducer'
      });
    }
    
    // Check for excessive useEffect usage
    const useEffectMatches = content.match(/useEffect\(/g) || [];
    if (useEffectMatches.length > 2) {
      results.excessiveEffectComponents++;
      results.optimizationOpportunities.push({
        file: filePath,
        issue: 'Excessive useEffect',
        count: useEffectMatches.length,
        suggestion: 'Review effects for data fetching that could be moved to server components'
      });
    }
    
    // Check for data fetching in useEffect
    if (content.includes('useEffect') && 
        (content.includes('fetch(') || content.includes('axios') || content.includes('.json'))) {
      results.optimizationOpportunities.push({
        file: filePath,
        issue: 'Client-side data fetching',
        suggestion: 'Move data fetching to server components or use React 19 data fetching patterns'
      });
    }
    
    // Check for lazy loading without Suspense
    if ((content.includes('lazy(') || content.includes('dynamic(')) && 
        !content.includes('<Suspense')) {
      results.missingSuspenseBoundaries++;
      results.optimizationOpportunities.push({
        file: filePath,
        issue: 'Missing Suspense boundary',
        suggestion: 'Add Suspense boundary around lazy-loaded components'
      });
    }
    
    // Check for nested useState updates that could benefit from useTransition
    if (content.includes('useState') && 
        content.includes('setState') && 
        !content.includes('useTransition') &&
        (content.includes('map(') || content.includes('filter(') || content.includes('reduce('))) {
      results.optimizationOpportunities.push({
        file: filePath,
        issue: 'Potential UI blocking',
        suggestion: 'Use useTransition for expensive state updates'
      });
    }
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
  }
};

// Recursively process all component files in a directory
const processDirectory = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and .next directories
        if (file !== 'node_modules' && file !== '.next') {
          processDirectory(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        analyzeComponentFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
};

// Generate optimization report
const generateReport = () => {
  const report = {
    summary: {
      clientComponents: results.clientComponents,
      componentsWithOptimizationOpportunities: results.optimizationOpportunities.length,
      excessiveStateComponents: results.excessiveStateComponents,
      excessiveEffectComponents: results.excessiveEffectComponents,
      missingSuspenseBoundaries: results.missingSuspenseBoundaries
    },
    optimizationOpportunities: results.optimizationOpportunities
  };
  
  // Write report to file
  const reportPath = path.resolve(__dirname, '../optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown report
  const markdownReport = `# Client Component Optimization Report

## Summary

- **Client Components Analyzed:** ${report.summary.clientComponents}
- **Components with Optimization Opportunities:** ${report.summary.componentsWithOptimizationOpportunities}
- **Components with Excessive State:** ${report.summary.excessiveStateComponents}
- **Components with Excessive Effects:** ${report.summary.excessiveEffectComponents}
- **Components Missing Suspense Boundaries:** ${report.summary.missingSuspenseBoundaries}

## Optimization Opportunities

${report.optimizationOpportunities.map(opportunity => `
### ${path.basename(opportunity.file)}

- **Issue:** ${opportunity.issue}${opportunity.count ? ` (${opportunity.count} instances)` : ''}
- **File:** \`${opportunity.file}\`
- **Suggestion:** ${opportunity.suggestion}
`).join('\n')}

## Next Steps

1. Review components with excessive state and consider consolidation
2. Move data fetching from client components to server components
3. Add proper Suspense boundaries around lazy-loaded components
4. Implement useTransition for expensive state updates
5. Follow the guidelines in \`docs/CLIENT_COMPONENT_OPTIMIZATION.md\`
`;
  
  const markdownPath = path.resolve(__dirname, '../docs/OPTIMIZATION_REPORT.md');
  fs.writeFileSync(markdownPath, markdownReport);
  
  console.log(`Report generated at ${reportPath}`);
  console.log(`Markdown report generated at ${markdownPath}`);
  
  return report;
};

// Main execution
console.log('Analyzing client components...');
DIRS_TO_ANALYZE.forEach(dir => {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
});

const report = generateReport();

console.log('\nAnalysis complete!');
console.log(`Found ${report.summary.clientComponents} client components`);
console.log(`Found ${report.summary.componentsWithOptimizationOpportunities} components with optimization opportunities`);
console.log(`See ${path.resolve(__dirname, '../docs/OPTIMIZATION_REPORT.md')} for details`);
