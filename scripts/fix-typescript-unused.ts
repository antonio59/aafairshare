#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { glob } from 'glob';

interface ProcessingResult {
  filePath: string;
  modified: boolean;
  fixedCount: number;
  error?: string;
}

interface FileModification {
  line: string;
  modified: boolean;
  fixes: number;
}

type LineProcessor = (line: string, unusedVars: Set<string>) => FileModification;

function processImportLine(line: string, unusedVars: Set<string>): FileModification {
  let modified = false;
  let fixes = 0;
  let modifiedLine = line;

  for (const unusedVar of unusedVars) {
    // Match exactly the variable name with word boundaries
    const regex = new RegExp(`(\\s|,|{)(${unusedVar})(\\s|,|})`, 'g');
    if (regex.test(modifiedLine)) {
      modifiedLine = modifiedLine.replace(regex, `$1_${unusedVar}$3`);
      modified = true;
      fixes++;
    }
  }

  return { line: modifiedLine, modified, fixes };
}

function processVariableLine(line: string, unusedVars: Set<string>): FileModification {
  let modified = false;
  let fixes = 0;
  let modifiedLine = line;

  for (const unusedVar of unusedVars) {
    // Regex to match variable declarations
    const constRegex = new RegExp(`(const|let|var)\\s+(${unusedVar})\\s*=`, 'g');
    const destructureRegex = new RegExp(`(\\s|,|{)(${unusedVar})(\\s*)(,|})`, 'g');

    if (constRegex.test(modifiedLine)) {
      modifiedLine = modifiedLine.replace(constRegex, `$1 _${unusedVar} =`);
      modified = true;
      fixes++;
    } else if (destructureRegex.test(modifiedLine)) {
      modifiedLine = modifiedLine.replace(destructureRegex, `$1_${unusedVar}$3$4`);
      modified = true;
      fixes++;
    }
  }

  return { line: modifiedLine, modified, fixes };
}

async function processFile(filePath: string): Promise<ProcessingResult> {
  try {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fixedCount = 0;

    // Get TypeScript errors for this file
    const tsErrors = execSync(
      `npx tsc --noEmit --pretty false ${filePath} 2>&1 || true`,
      { encoding: 'utf8' }
    );

    // Extract unused variable names using regex
    const unusedVarRegex = /error TS6133: '([^']+)' is declared but its value is never read/g;
    const unusedVars = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = unusedVarRegex.exec(tsErrors)) !== null) {
      unusedVars.add(match[1]);
    }

    if (unusedVars.size === 0) {
      return { filePath, modified: false, fixedCount: 0 };
    }

    // Process the file content
    const newLines: string[] = [];
    let inImportStatement = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if we're in an import statement
      if (line.includes('import ')) {
        inImportStatement = !line.includes(';') || line.indexOf('{') > line.indexOf(';');
      } else if (inImportStatement && line.includes(';')) {
        inImportStatement = false;
      }

      // Process line based on context
      const processor: LineProcessor = inImportStatement ? processImportLine : processVariableLine;
      const { line: newLine, modified: lineModified, fixes } = processor(line, unusedVars);

      if (lineModified) {
        modified = true;
        fixedCount += fixes;
      }

      newLines.push(newLine);
    }

    // Write changes back to file if modifications were made
    if (modified) {
      await writeFile(filePath, newLines.join('\n'), 'utf8');
    }

    return { filePath, modified, fixedCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error processing ${filePath}:`, errorMessage);
    return { filePath, modified: false, fixedCount: 0, error: errorMessage };
  }
}

async function fixUnusedVariables(): Promise<void> {
  try {
    // Find all TypeScript files
    const files = await glob('src/**/*.{ts,tsx}', { 
      ignore: ['**/node_modules/**', '**/*.d.ts'] 
    });

    console.log(`🔍 Found ${files.length} TypeScript files to process...\n`);

    // Process each file
    const results: ProcessingResult[] = [];
    for (const file of files) {
      console.log(`Processing ${file}...`);
      const result = await processFile(file);
      results.push(result);
    }

    // Print summary
    const modifiedFiles = results.filter(r => r.modified);
    const totalFixed = modifiedFiles.reduce((sum, r) => sum + r.fixedCount, 0);
    const filesWithErrors = results.filter(r => r.error);

    console.log('\n📊 Summary:');
    console.log(`Total files processed: ${results.length}`);
    console.log(`Modified files: ${modifiedFiles.length}`);
    console.log(`Total unused variables fixed: ${totalFixed}`);

    if (filesWithErrors.length > 0) {
      console.log('\n⚠️ Files with errors:');
      filesWithErrors.forEach(r => {
        console.log(`- ${r.filePath}: ${r.error}`);
      });
    }

    if (modifiedFiles.length > 0) {
      console.log('\n✅ Modified files:');
      modifiedFiles.forEach(r => {
        console.log(`- ${r.filePath} (${r.fixedCount} fixes)`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
fixUnusedVariables().catch(error => {
  console.error('❌ Unhandled error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
