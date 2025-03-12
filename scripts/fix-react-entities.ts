import { readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

interface ESLintMessage {
  ruleId: string;
  message: string;
  line: number;
  column: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

interface ProcessingResult {
  filesModified: number;
  entitiesFixed: number;
}

interface EntityReplacement {
  pattern: RegExp;
  replacement: string;
}

const entityReplacements: Record<string, EntityReplacement> = {
  "'": { pattern: /'/g, replacement: '&apos;' },
  '"': { pattern: /"/g, replacement: '&quot;' }
};

function replaceEntityInLine(
  line: string, 
  column: number, 
  pattern: RegExp, 
  replacement: string
): string {
  const prefix = line.substring(0, column);
  const postfix = line.substring(column).replace(pattern, replacement);
  return prefix + postfix;
}

async function processFile(
  filePath: string, 
  messages: ESLintMessage[]
): Promise<{ modified: boolean; fixed: number }> {
  console.log(`\nProcessing ${filePath}:`);
  console.log(`Found ${messages.length} unescaped entities`);
  
  const fileContent = await readFile(filePath, 'utf8');
  const lines = fileContent.split('\n');
  let fixed = 0;
  
  for (const msg of messages) {
    const { line, column } = msg;
    console.log(`  - Line ${line}, Column ${column}`);
    
    const lineContent = lines[line - 1];
    let newLineContent = lineContent;
    
    // Find which entity needs replacing
    for (const [entity, { pattern, replacement }] of Object.entries(entityReplacements)) {
      if (msg.message.includes(entity)) {
        newLineContent = replaceEntityInLine(lineContent, column, pattern, replacement);
        break;
      }
    }
    
    if (newLineContent !== lineContent) {
      lines[line - 1] = newLineContent;
      fixed++;
    }
  }
  
  if (fixed > 0) {
    await writeFile(filePath, lines.join('\n'), 'utf8');
    return { modified: true, fixed };
  }
  
  return { modified: false, fixed: 0 };
}

async function fixReactEntities(): Promise<ProcessingResult> {
  console.log('Getting list of unescaped entities warnings...');
  
  const lintOutput = execSync(
    'npx eslint --ext .ts,.tsx src/ --format json',
    { encoding: 'utf8' }
  );
  
  const lintResults = JSON.parse(lintOutput) as ESLintResult[];
  const result: ProcessingResult = { filesModified: 0, entitiesFixed: 0 };
  
  for (const lintResult of lintResults) {
    const unescapedEntitiesMessages = lintResult.messages.filter(msg => 
      msg.ruleId === 'react/no-unescaped-entities'
    );
    
    if (unescapedEntitiesMessages.length === 0) {
      continue;
    }
    
    const { modified, fixed } = await processFile(
      lintResult.filePath, 
      unescapedEntitiesMessages
    );
    
    if (modified) {
      result.filesModified++;
      result.entitiesFixed += fixed;
    }
  }
  
  return result;
}

// Run the script
fixReactEntities()
  .then(({ filesModified, entitiesFixed }) => {
    console.log(`\n✅ Completed! Modified ${filesModified} files and fixed ${entitiesFixed} unescaped entities.`);
    console.log('Note: Please review the changes as they may affect the appearance of text in your components.');
  })
  .catch(error => {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
