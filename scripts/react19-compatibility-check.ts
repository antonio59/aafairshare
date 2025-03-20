#!/usr/bin/env tsx

/**
 * React 19 Compatibility Check Script
 * 
 * This script analyzes the codebase for potential React 19 compatibility issues:
 * 1. Missing effect cleanups
 * 2. Legacy API usage
 * 3. Server/client component boundaries
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Define patterns to search for
const patterns = {
  useEffectWithoutCleanup: /useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*(?!\breturn\b)[^}]*\}\s*,\s*\[[^\]]*\]\s*\)/g,
  legacyLifecycleMethods: /(componentWillMount|componentWillReceiveProps|componentWillUpdate)/g,
  serverImportingClientComponent: /'use client'[\s\S]*?from\s+['"]([^'"]*[/\\](?!.*['"]use client['"]).*)['"]/g,
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
  blue: '\x1b[34m',
};

const warnings: { file: string; line: number; message: string; code: string }[] = [];
const errors: { file: string; line: number; message: string; code: string }[] = [];

async function analyzeFile(filePath: string) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check for effects without cleanup
  let match;
  let lineNumber = 0;
  
  for (const line of lines) {
    lineNumber++;
    
    // Check for useEffect without cleanup
    if (line.includes('useEffect') && !line.includes('import')) {
      const effectBlock = line + '\n' + lines.slice(lineNumber, lineNumber + 10).join('\n');
      if (effectBlock.includes('useEffect') && 
          !effectBlock.includes('return') && 
          effectBlock.includes('[]')) {
        warnings.push({
          file: filePath,
          line: lineNumber,
          message: 'useEffect without cleanup function',
          code: line.trim(),
        });
      }
    }
    
    // Check for legacy lifecycle methods
    if (patterns.legacyLifecycleMethods.test(line)) {
      errors.push({
        file: filePath,
        line: lineNumber,
        message: 'Legacy lifecycle method detected',
        code: line.trim(),
      });
    }
  }
  
  // Check for server components importing client components
  if (!content.includes('use client') && content.includes('import')) {
    // This is a server component
    const imports = content.match(/import[\s\S]*?from\s+['"]([^'"]*)['"]/g) || [];
    
    for (const importStmt of imports) {
      if (importStmt.includes('components/') || importStmt.includes('@/components/')) {
        // Check if it's importing a client component
        const importPath = importStmt.match(/from\s+['"]([^'"]*)['"]/)?.[1];
        if (importPath) {
          let resolvedPath = '';
          
          if (importPath.startsWith('@/')) {
            resolvedPath = path.join(process.cwd(), 'src', importPath.slice(2));
          } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
            resolvedPath = path.join(path.dirname(filePath), importPath);
          }
          
          if (resolvedPath && fs.existsSync(resolvedPath + '.tsx')) {
            const importedContent = fs.readFileSync(resolvedPath + '.tsx', 'utf8');
            if (importedContent.includes('use client')) {
              warnings.push({
                file: filePath,
                line: lineNumber,
                message: 'Server component importing client component',
                code: importStmt.trim(),
              });
            }
          }
        }
      }
    }
  }
}

async function main() {
  console.log(`${colors.blue}React 19 Compatibility Check${colors.reset}`);
  console.log('Scanning for potential compatibility issues...\n');
  
  const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**', '**/.next/**'] });
  
  await Promise.all(files.map(analyzeFile));
  
  // Display warnings
  if (warnings.length > 0) {
    console.log(`${colors.yellow}Warnings (${warnings.length}):${colors.reset}`);
    warnings.forEach(({ file, line, message, code }) => {
      console.log(`${colors.yellow}[WARNING]${colors.reset} ${file}:${line} - ${message}`);
      console.log(`  ${code}`);
    });
    console.log('');
  }
  
  // Display errors
  if (errors.length > 0) {
    console.log(`${colors.red}Errors (${errors.length}):${colors.reset}`);
    errors.forEach(({ file, line, message, code }) => {
      console.log(`${colors.red}[ERROR]${colors.reset} ${file}:${line} - ${message}`);
      console.log(`  ${code}`);
    });
    console.log('');
  }
  
  if (warnings.length === 0 && errors.length === 0) {
    console.log(`${colors.green}No compatibility issues found!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Recommendations:${colors.reset}`);
    console.log('1. Add cleanup functions to useEffect hooks that create subscriptions or timers');
    console.log('2. Replace legacy lifecycle methods with function components and hooks');
    console.log('3. Ensure proper server/client component boundaries');
    console.log('\nRun npm test to verify that your components still work correctly after fixing these issues.');
  }
}

main().catch(console.error);
