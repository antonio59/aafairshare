#!/usr/bin/env node

/**
 * Script to automatically prefix unused variables with an underscore
 * This helps satisfy TypeScript's no-unused-vars rule
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

interface ESLintMessage {
  ruleId: string;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  severity: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

interface FixStats {
  filesModified: number;
  variablesFixed: number;
}

interface VariableReplacement {
  original: string;
  prefixed: string;
  regex: RegExp;
}

/**
 * Check if a variable name is already prefixed with underscore
 */
function isAlreadyPrefixed(varName: string): boolean {
  return varName.startsWith('_');
}

/**
 * Extract variable name from ESLint message
 */
function extractVariableName(message: string): string | null {
  const match = message.match(/'([^']+)'/);
  return match ? match[1] : null;
}

/**
 * Create regex patterns for variable replacement
 */
function createReplacementPatterns(varName: string): VariableReplacement[] {
  return [
    // Variable declarations (const, let, var, function, class)
    {
      original: varName,
      prefixed: `_${varName}`,
      regex: new RegExp(`\\b(const|let|var|function|class)\\s+(${varName})\\b`, 'g')
    },
    // Function parameters
    {
      original: varName,
      prefixed: `_${varName}`,
      regex: new RegExp(`(\\(|,)\\s*(${varName})\\s*(:)`, 'g')
    },
    // Destructuring patterns
    {
      original: varName,
      prefixed: `_${varName}`,
      regex: new RegExp(`(\\{|,)\\s*(${varName})\\s*(\\}|,)`, 'g')
    },
    // Object property aliasing
    {
      original: varName,
      prefixed: `_${varName}`,
      regex: new RegExp(`(\\{|,)\\s*(${varName})\\s*:\\s*([^,\\}]+)`, 'g')
    }
  ];
}

/**
 * Process a single file and fix unused variables
 */
function processFile(result: ESLintResult): { modified: boolean; fixCount: number } {
  const unusedVarMessages = result.messages.filter(msg => 
    msg.ruleId === '@typescript-eslint/no-unused-vars' && 
    (msg.message.includes('is defined but never used') || 
     msg.message.includes('is assigned a value but never used'))
  );

  if (unusedVarMessages.length === 0) {
    return { modified: false, fixCount: 0 };
  }

  console.log(`\nProcessing ${result.filePath}:`);
  console.log(`Found ${unusedVarMessages.length} unused variables`);

  let fileContent = readFileSync(result.filePath, 'utf8');
  let fixCount = 0;

  // Process each unused variable
  unusedVarMessages.forEach(msg => {
    const varName = extractVariableName(msg.message);
    if (!varName || isAlreadyPrefixed(varName)) {
      return;
    }

    console.log(`  - Fixing: ${varName}`);

    // Apply all replacement patterns
    const patterns = createReplacementPatterns(varName);
    patterns.forEach(pattern => {
      if (fileContent.includes(pattern.original)) {
        fileContent = fileContent.replace(pattern.regex, (match, p1, p2, p3) => {
          // Handle different replacement cases
          if (match.includes(':')) {
            // Object property aliasing
            return `${p1} ${p2}: ${pattern.prefixed}`;
          } else if (p3 === ':') {
            // Function parameters
            return `${p1} ${pattern.prefixed}${p3}`;
          } else if (p3 === '}' || p3 === ',') {
            // Destructuring
            return `${p1} ${p2}: ${pattern.prefixed}${p3}`;
          } else {
            // Standard variable declaration
            return `${p1} ${pattern.prefixed}`;
          }
        });
      }
    });

    fixCount++;
  });

  if (fixCount > 0) {
    writeFileSync(result.filePath, fileContent, 'utf8');
  }

  return { modified: fixCount > 0, fixCount };
}

/**
 * Main function to fix unused variables
 */
async function main(): Promise<void> {
  try {
    console.log('Getting list of unused variables...');
    
    // Run ESLint and get results
    const lintOutput = execSync(
      'npx eslint --ext .ts,.tsx src/ --format json',
      { encoding: 'utf8' }
    );
    
    const lintResults: ESLintResult[] = JSON.parse(lintOutput);
    const stats: FixStats = {
      filesModified: 0,
      variablesFixed: 0
    };

    // Process each file
    lintResults.forEach(result => {
      const { modified, fixCount } = processFile(result);
      if (modified) {
        stats.filesModified++;
        stats.variablesFixed += fixCount;
      }
    });

    // Print summary
    console.log('\nSummary:');
    console.log('-'.repeat(40));
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`Variables fixed: ${stats.variablesFixed}`);
    console.log('\nNote: Please review the changes as some complex cases may need manual attention.');

  } catch (error) {
    console.error('Error fixing unused variables:', 
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', 
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
