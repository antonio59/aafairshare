#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Function to process a file
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fixedCount = 0;

    // Regular expressions to find unused variables
    const unusedVarRegex = /error TS6133: '([^']+)' is declared but its value is never read/g;
    
    // Get the TypeScript errors for this file
    const { execSync } = await import('child_process');
    const tsErrors = execSync(`npx tsc --noEmit --pretty false ${filePath} 2>&1 || true`, { encoding: 'utf8' });
    
    // Extract unused variable names
    const unusedVars = [];
    let match;
    while ((match = unusedVarRegex.exec(tsErrors)) !== null) {
      unusedVars.push(match[1]);
    }
    
    if (unusedVars.length === 0) {
      return { filePath, modified: false, fixedCount: 0 };
    }
    
    // Create a set for faster lookups
    const unusedVarSet = new Set(unusedVars);
    
    // Process the file content
    const newLines = [];
    let inImportStatement = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Check if we're in an import statement
      if (line.includes('import ')) {
        inImportStatement = !line.includes(';') || line.indexOf('{') > line.indexOf(';');
      } else if (inImportStatement && line.includes(';')) {
        inImportStatement = false;
      }
      
      // Handle import statements
      if (inImportStatement) {
        for (const unusedVar of unusedVarSet) {
          // Match exactly the variable name with word boundaries
          const regex = new RegExp(`(\\s|,|{)(${unusedVar})(\\s|,|})`, 'g');
          if (regex.test(line)) {
            line = line.replace(regex, `$1_${unusedVar}$3`);
            modified = true;
            fixedCount++;
          }
        }
      } 
      // Handle variable declarations
      else {
        for (const unusedVar of unusedVarSet) {
          // Regex to match variable declarations
          const constRegex = new RegExp(`(const|let|var)\\s+(${unusedVar})\\s*=`, 'g');
          const destructureRegex = new RegExp(`(\\s|,|{)(${unusedVar})(\\s*)(,|})`, 'g');
          
          if (constRegex.test(line)) {
            line = line.replace(constRegex, `$1 _${unusedVar} =`);
            modified = true;
            fixedCount++;
          } 
          else if (destructureRegex.test(line)) {
            line = line.replace(destructureRegex, `$1_${unusedVar}$3$4`);
            modified = true;
            fixedCount++;
          }
        }
      }
      
      newLines.push(line);
    }
    
    // Write changes back to the file if modifications were made
    if (modified) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    }
    
    return { filePath, modified, fixedCount };
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return { filePath, modified: false, fixedCount: 0, error: err.message };
  }
}

// Main function
async function main() {
  try {
    // Find all TypeScript files
    const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**', '**/*.d.ts'] });
    
    // Process each file
    const results = [];
    for (const file of files) {
      console.log(`Processing ${file}...`);
      const result = await processFile(file);
      results.push(result);
    }
    
    // Print summary
    const modifiedFiles = results.filter(r => r.modified);
    const totalFixed = modifiedFiles.reduce((sum, r) => sum + r.fixedCount, 0);
    
    console.log('\nSummary:');
    console.log(`Total files processed: ${results.length}`);
    console.log(`Modified files: ${modifiedFiles.length}`);
    console.log(`Total unused variables fixed: ${totalFixed}`);
    
    if (modifiedFiles.length > 0) {
      console.log('\nModified files:');
      modifiedFiles.forEach(r => {
        console.log(`- ${r.filePath} (${r.fixedCount} fixes)`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 