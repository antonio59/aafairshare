#!/usr/bin/env node

/**
 * Script to automatically fix type imports to use the `import type` syntax
 * This addresses the verbatimModuleSyntax TypeScript configuration option
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync } = require('child_process');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Known types that should be imported with 'import type'
const typeNames = [
  'ReactNode',
  'PropsWithChildren',
  'ButtonHTMLAttributes',
  'InputHTMLAttributes',
  'FormHTMLAttributes',
  'FormEvent',
  'Dispatch',
  'SetStateAction',
  'ChangeEvent',
  'MouseEvent',
  'KeyboardEvent',
  'FC',
  'FunctionComponent',
  'Category',
  'Location',
  'Expense',
  'User',
  'Settlement',
  'Database',
  'AuthUser',
  'Session',
  'AppRouterInstance',
  'Metadata',
  'CookieOptions'
];

// Regular expression to find import statements with types
const importTypeRegex = new RegExp(`import\\s+{\\s*((${typeNames.join('|')})\\s*(,\\s*[\\w{}\\s,]*)?)*\\s*}\\s+from\\s+['"][^'"]+['"]`, 'g');

// Function to check if a path is a TypeScript/React file
const isTypeScriptFile = (filePath) => {
  return /\.(ts|tsx)$/.test(filePath);
};

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await readdir(dirPath);
  
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry);
    const entryStat = await stat(entryPath);
    
    if (entryStat.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry !== 'node_modules' && entry !== '.git' && entry !== '.next' && entry !== 'dist') {
        await processDirectory(entryPath);
      }
    } else if (isTypeScriptFile(entryPath)) {
      await processFile(entryPath);
    }
  }
}

// Function to process a single file
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    let modified = false;
    
    // Detect imports of type names without 'import type'
    const modifiedContent = content.replace(importTypeRegex, (match) => {
      // Check if any of our type names are in the import
      const hasType = typeNames.some(typeName => {
        const regex = new RegExp(`\\b${typeName}\\b`);
        return regex.test(match);
      });
      
      if (hasType && !match.includes('import type')) {
        modified = true;
        return match.replace('import ', 'import type ');
      }
      
      return match;
    });
    
    // Only write the file if it was modified
    if (modified) {
      console.log(`Fixing imports in: ${filePath}`);
      await writeFile(filePath, modifiedContent, 'utf-8');
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function main() {
  const rootPath = process.cwd();
  console.log(`Scanning files in: ${rootPath}`);
  await processDirectory(rootPath);
  console.log('Type import fixing completed!');
}

main().catch(console.error);
