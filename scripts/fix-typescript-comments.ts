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
  commentsFixed: number;
}

async function processFile(filePath: string, warnings: ESLintMessage[]): Promise<boolean> {
  console.log(`\nProcessing ${filePath}:`);
  console.log(`Found ${warnings.length} @ts-ignore comments`);
  
  const fileContent = await readFile(filePath, 'utf8');
  
  if (!fileContent.includes('@ts-ignore')) {
    return false;
  }
  
  const newContent = fileContent.replace(/@ts-ignore/g, '@ts-expect-error');
  
  if (newContent === fileContent) {
    return false;
  }
  
  await writeFile(filePath, newContent, 'utf8');
  return true;
}

async function fixTypeScriptComments(): Promise<ProcessingResult> {
  console.log('Getting list of ts-comment warnings...');
  
  const lintOutput = execSync(
    'npx eslint --ext .ts,.tsx src/ --format json',
    { encoding: 'utf8' }
  );
  
  const lintResults = JSON.parse(lintOutput) as ESLintResult[];
  let result: ProcessingResult = { filesModified: 0, commentsFixed: 0 };
  
  for (const lintResult of lintResults) {
    const tsCommentWarnings = lintResult.messages.filter(msg => 
      msg.ruleId === '@typescript-eslint/ban-ts-comment' &&
      msg.message.includes('@ts-ignore')
    );
    
    if (tsCommentWarnings.length === 0) {
      continue;
    }
    
    const fileContent = await readFile(lintResult.filePath, 'utf8');
    const wasModified = await processFile(lintResult.filePath, tsCommentWarnings);
    
    if (wasModified) {
      result.filesModified++;
      result.commentsFixed += (fileContent.match(/@ts-ignore/g) || []).length;
    }
  }
  
  return result;
}

// Run the script
fixTypeScriptComments()
  .then(({ filesModified, commentsFixed }) => {
    console.log(`\n✅ Completed! Modified ${filesModified} files and fixed ${commentsFixed} @ts-ignore comments.`);
    console.log('Note: Please review the changes as @ts-expect-error is more strict than @ts-ignore.');
  })
  .catch(error => {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
