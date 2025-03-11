#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { execSync, ExecSyncOptions } from 'child_process';

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

interface LintFixOptions {
  autoFix: boolean;
  importOrder: boolean;
  unusedVars: boolean;
}

interface FixResult {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Run ESLint with specific options
 */
function sanitizeCommand(command: string): string {
  // Ensure command only contains allowed ESLint patterns
  const allowedCommands = ['npx', 'eslint'];
  const allowedFlags = ['--ext', '--fix', '--rule', '.ts,.tsx'];
  const allowedPaths = ['src/'];
  
  const parts = command.split(' ').filter(Boolean);
  
  // Validate each part of the command
  for (const part of parts) {
    const isAllowed = 
      allowedCommands.includes(part) ||
      allowedFlags.includes(part) ||
      allowedPaths.includes(part) ||
      part.startsWith('"import/order:') ||
      /\.(ts|tsx)$/.test(part);
      
    if (!isAllowed) {
      throw new Error(`Invalid command part: ${part}`);
    }
  }
  
  return command;
}

function runESLint(command: string, description: string): FixResult {
  try {
    // Sanitize command before execution
    const sanitizedCommand = sanitizeCommand(command);
    
    const options: ExecSyncOptions = { 
      stdio: 'inherit',
      shell: '/bin/bash' // Explicitly specify shell
    };
    execSync(sanitizedCommand, options);
    return {
      success: true,
      message: `${description} completed successfully`
    };
  } catch (error) {
    return {
      success: false,
      message: `${description} encountered some issues`,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fix unused variables by prefixing them with underscore
 */
function prefixUnusedVariables(filePath: string): void {
  const content = readFileSync(filePath, 'utf8');
  
  // Regular expressions to find common patterns of unused variables
  const unusedVarRegex = /'([a-zA-Z0-9]+)' is (defined but never used|assigned a value but never used)/g;
  const matches = Array.from(content.matchAll(unusedVarRegex));
  
  if (matches.length > 0) {
    console.log(`Found ${matches.length} unused variables in ${filePath}`);
    
    // Create a set of variable names to avoid duplicates
    const unusedVars = new Set(matches.map(match => match[1]));
    
    // Read the actual source file
    const sourceFile = filePath.replace('.lint-report', '');
    if (!existsSync(sourceFile)) {
      console.log(`Source file not found: ${sourceFile}`);
      return;
    }
    
    let sourceContent = readFileSync(sourceFile, 'utf8');
    
    // Replace variable declarations
    for (const varName of unusedVars) {
      // Don't prefix if already prefixed
      if (varName.startsWith('_')) continue;
      
      // Replace variable declarations with prefixed versions
      const varRegex = new RegExp(
        `\\b(const|let|var|function|class|interface)\\s+${varName}\\b`, 
        'g'
      );
      sourceContent = sourceContent.replace(varRegex, `$1 _${varName}`);
      
      // Replace in function parameters
      const paramRegex = new RegExp(`\\((.*?)\\b${varName}\\b(.*?)\\)`, 'g');
      sourceContent = sourceContent.replace(paramRegex, (match, before, after) => {
        return `(${before}_${varName}${after})`;
      });
      
      // Replace in destructuring patterns
      const destructureRegex = new RegExp(`\\{([^}]*?)\\b${varName}\\b([^}]*?)\\}`, 'g');
      sourceContent = sourceContent.replace(destructureRegex, (match, before, after) => {
        return `{${before}${varName} as _${varName}${after}}`;
      });
    }
    
    writeFileSync(sourceFile, sourceContent, 'utf8');
    console.log(`Updated ${sourceFile}`);
  }
}

/**
 * Run all lint fixes
 */
async function fixLintIssues(options: LintFixOptions = {
  autoFix: true,
  importOrder: true,
  unusedVars: true
}): Promise<void> {
  console.log('Starting lint fixes...');
  
  if (options.autoFix) {
    console.log('\nRunning ESLint auto-fix...');
    const autoFixResult = runESLint(
      'npx eslint --ext .ts,.tsx --fix src/',
      'ESLint auto-fix'
    );
    console.log(autoFixResult.message);
  }
  
  if (options.importOrder) {
    console.log('\nFixing import order issues...');
    const importOrderResult = runESLint(
      'npx eslint --ext .ts,.tsx --fix --rule "import/order: error" src/',
      'Import order fix'
    );
    console.log(importOrderResult.message);
  }
  
  if (options.unusedVars) {
    console.log('\nFixing unused variables...');
    // Create temporary lint report
    const reportPath = join(process.cwd(), 'temp-lint-report.txt');
    try {
      const sanitizedReportCommand = sanitizeCommand('npx eslint --ext .ts,.tsx src/');
      execSync(`${sanitizedReportCommand} > ${reportPath}`, { 
        stdio: 'pipe',
        shell: '/bin/bash'
      });
      prefixUnusedVariables(reportPath);
    } catch (error) {
      const errorMessage = toErrorWithMessage(error).message;
      console.error('Error while fixing unused variables:', errorMessage);
    } finally {
      // Clean up temporary report
      try {
        await unlink(reportPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
  
  console.log('\nLint fixing script completed.');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: LintFixOptions = {
  autoFix: !args.includes('--no-autofix'),
  importOrder: !args.includes('--no-import-order'),
  unusedVars: !args.includes('--no-unused-vars')
};

// Run the fixes
fixLintIssues(options).catch(error => {
  const errorMessage = toErrorWithMessage(error).message;
  console.error('Unhandled error:', errorMessage);
  process.exit(1);
});
