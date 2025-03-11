// Script to fix @ts-ignore comments to @ts-expect-error
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Run ESLint to get the list of ts-comment warnings
console.log('Getting list of ts-comment warnings...');
const lintOutput = execSync('npx eslint --ext .ts,.tsx src/ --format json', { encoding: 'utf8' });
const lintResults = JSON.parse(lintOutput);

// Process the lint results
let filesModified = 0;
let commentsFixed = 0;

lintResults.forEach(result => {
  const filePath = result.filePath;
  
  // Filter for ts-comment warnings
  const tsCommentWarnings = result.messages.filter(msg => 
    msg.ruleId === '@typescript-eslint/ban-ts-comment' &&
    msg.message.includes('@ts-ignore')
  );
  
  if (tsCommentWarnings.length > 0) {
    console.log(`\nProcessing ${filePath}:`);
    console.log(`Found ${tsCommentWarnings.length} @ts-ignore comments`);
    
    // Read the file content
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace all @ts-ignore with @ts-expect-error
    if (fileContent.includes('@ts-ignore')) {
      const newContent = fileContent.replace(/@ts-ignore/g, '@ts-expect-error');
      
      if (newContent !== fileContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        modified = true;
        commentsFixed += (newContent.match(/@ts-expect-error/g) || []).length - 
                         (fileContent.match(/@ts-expect-error/g) || []).length;
      }
      
      if (modified) {
        filesModified++;
      }
    }
  }
});

console.log(`\nCompleted! Modified ${filesModified} files and fixed ${commentsFixed} @ts-ignore comments.`);
console.log('Note: Please review the changes as @ts-expect-error is more strict than @ts-ignore.'); 