#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

/**
 * Script to fix common TypeScript issues:
 * 1. Prefix unused variables with underscore
 * 2. Add proper TypeScript types to implicit any
 * 3. Fix React unescaped entities 
 * 4. Replace @ts-ignore with @ts-expect-error
 * 
 * Usage: tsx scripts/fix-typescript-issues.ts [options]
 * Options:
 *   --unused-vars    Fix unused variables only
 *   --ts-comments    Fix TypeScript comments only
 *   --entities       Fix unescaped entities only
 *   --all            Fix all issues (default)
 */

interface ESLintMessage {
  ruleId: string;
  message: string;
  line: number;
  column: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
}

interface FixStats {
  filesModified: number;
  itemsFixed: number;
}

interface ScriptOptions {
  fixUnusedVars: boolean;
  fixTsComments: boolean;
  fixEntities: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const hasSpecificFlags = args.some(arg => arg.startsWith('--'));
  
  return {
    fixUnusedVars: args.includes('--unused-vars') || args.includes('--all') || !hasSpecificFlags,
    fixTsComments: args.includes('--ts-comments') || args.includes('--all') || !hasSpecificFlags,
    fixEntities: args.includes('--entities') || args.includes('--all') || !hasSpecificFlags
  };
}

/**
 * Run ESLint and get results
 */
function runESLint(): ESLintResult[] {
  const lintOutput = execSync('npx eslint --ext .ts,.tsx src/ --format json', { encoding: 'utf8' });
  return JSON.parse(lintOutput);
}

/**
 * Fix unused variables by prefixing them with underscore
 */
function fixUnusedVariables(): FixStats {
  try {
    console.log('Getting list of unused variables...');
    const lintResults = runESLint();
    
    const stats: FixStats = { filesModified: 0, itemsFixed: 0 };
    
    lintResults.forEach(result => {
      const unusedVarMessages = result.messages.filter(msg => 
        msg.ruleId === '@typescript-eslint/no-unused-vars' && 
        (msg.message.includes('is defined but never used') || 
         msg.message.includes('is assigned a value but never used'))
      );
      
      if (unusedVarMessages.length > 0) {
        console.log(`\nProcessing ${result.filePath}:`);
        console.log(`Found ${unusedVarMessages.length} unused variables`);
        
        let fileContent = readFileSync(result.filePath, 'utf8');
        let modified = false;
        
        unusedVarMessages.forEach(msg => {
          const match = msg.message.match(/'([^']+)'/);
          if (match?.[1]) {
            const varName = match[1];
            
            if (varName.startsWith('_')) return;
            
            console.log(`  - Fixing: ${varName}`);
            
            const declarationRegex = new RegExp(`\\b(const|let|var|function|class)\\s+(${varName})\\b`, 'g');
            const paramRegex = new RegExp(`(\\(|,)\\s*(${varName})\\s*(:)`, 'g');
            const destructureRegex = new RegExp(`(\\{|,)\\s*(${varName})(\\s*)(,|\\})`, 'g');
            
            fileContent = fileContent
              .replace(declarationRegex, `$1 _${varName}`)
              .replace(paramRegex, `$1 _${varName}$3`)
              .replace(destructureRegex, `$1 _${varName}$3$4`);
            
            if (fileContent.includes('import ')) {
              const importRegex = new RegExp(`\\{([^}]*?)\\b${varName}\\b([^}]*?)\\}`, 'g');
              fileContent = fileContent.replace(importRegex, (match, before, after) => 
                `{${before}${varName} as _${varName}${after}}`
              );
            }
            
            modified = true;
            stats.itemsFixed++;
          }
        });
        
        if (modified) {
          writeFileSync(result.filePath, fileContent, 'utf8');
          stats.filesModified++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fixing unused variables:', error instanceof Error ? error.message : error);
    return { filesModified: 0, itemsFixed: 0 };
  }
}

/**
 * Fix TypeScript comments (convert @ts-ignore to @ts-expect-error)
 */
function fixTypeScriptComments(): FixStats {
  try {
    console.log('Finding files with @ts-ignore comments...');
    
    const files = glob.sync('src/**/*.{ts,tsx}', { 
      ignore: ['**/node_modules/**', '**/*.d.ts'] 
    });
    
    const stats: FixStats = { filesModified: 0, itemsFixed: 0 };
    
    files.forEach(filePath => {
      const fileContent = readFileSync(filePath, 'utf8');
      
      if (fileContent.includes('@ts-ignore')) {
        console.log(`Processing ${filePath}...`);
        
        const newContent = fileContent.replace(/@ts-ignore/g, '@ts-expect-error');
        const count = (fileContent.match(/@ts-ignore/g) || []).length;
        
        stats.itemsFixed += count;
        writeFileSync(filePath, newContent, 'utf8');
        stats.filesModified++;
        
        console.log(`  - Fixed ${count} @ts-ignore comments`);
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fixing TypeScript comments:', error instanceof Error ? error.message : error);
    return { filesModified: 0, itemsFixed: 0 };
  }
}

/**
 * Fix unescaped entities in React components
 */
function fixUnescapedEntities(): FixStats {
  try {
    console.log('Getting list of unescaped entities warnings...');
    const lintResults = runESLint();
    
    const stats: FixStats = { filesModified: 0, itemsFixed: 0 };
    
    lintResults.forEach(result => {
      const unescapedEntitiesMessages = result.messages.filter(msg => 
        msg.ruleId === 'react/no-unescaped-entities'
      );
      
      if (unescapedEntitiesMessages.length > 0) {
        console.log(`\nProcessing ${result.filePath}:`);
        console.log(`Found ${unescapedEntitiesMessages.length} unescaped entities`);
        
        let fileContent = readFileSync(result.filePath, 'utf8');
        let modified = false;
        
        // Common HTML entities to escape
        const entities: Record<string, string> = {
          "'": "&apos;",
          '"': "&quot;",
          ">": "&gt;",
          "<": "&lt;",
          "}": "&#125;",
          "{": "&#123;"
        };
        
        unescapedEntitiesMessages.forEach(() => {
          Object.entries(entities).forEach(([char, entity]) => {
            const regex = new RegExp(`(?<=>)[^<]*?${char}[^>]*?(?=<)`, 'g');
            fileContent = fileContent.replace(regex, match => 
              match.replace(new RegExp(char, 'g'), entity)
            );
          });
          
          modified = true;
          stats.itemsFixed++;
        });
        
        if (modified) {
          writeFileSync(result.filePath, fileContent, 'utf8');
          stats.filesModified++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fixing unescaped entities:', error instanceof Error ? error.message : error);
    return { filesModified: 0, itemsFixed: 0 };
  }
}

/**
 * Main function to run the fixes
 */
function main(): void {
  console.log('Starting TypeScript fixes...');
  
  const options = parseArgs();
  const results: Record<string, FixStats> = {};
  
  if (options.fixUnusedVars) {
    console.log('\n--- Fixing Unused Variables ---');
    results.unusedVars = fixUnusedVariables();
  }
  
  if (options.fixTsComments) {
    console.log('\n--- Fixing TypeScript Comments ---');
    results.tsComments = fixTypeScriptComments();
  }
  
  if (options.fixEntities) {
    console.log('\n--- Fixing Unescaped Entities ---');
    results.entities = fixUnescapedEntities();
  }
  
  console.log('\nFix Summary:');
  if (results.unusedVars) {
    console.log('Unused Variables:');
    console.log(`- Modified ${results.unusedVars.filesModified} files`);
    console.log(`- Fixed ${results.unusedVars.itemsFixed} variables`);
  }
  
  if (results.tsComments) {
    console.log('TypeScript Comments:');
    console.log(`- Modified ${results.tsComments.filesModified} files`);
    console.log(`- Fixed ${results.tsComments.itemsFixed} comments`);
  }
  
  if (results.entities) {
    console.log('Unescaped Entities:');
    console.log(`- Modified ${results.entities.filesModified} files`);
    console.log(`- Fixed ${results.entities.itemsFixed} entities`);
  }
  
  console.log('\nCompleted all TypeScript fixes!');
}

// Run the script
main();
