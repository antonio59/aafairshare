// Script to fix unescaped entities in React components
import fs from 'fs';
import { execSync } from 'child_process';

// Run ESLint to get the list of unescaped entities warnings
console.log('Getting list of unescaped entities warnings...');
const lintOutput = execSync('npx eslint --ext .ts,.tsx src/ --format json', { encoding: 'utf8' });
const lintResults = JSON.parse(lintOutput);

// Process the lint results
let filesModified = 0;
let entitiesFixed = 0;

lintResults.forEach(result => {
  const filePath = result.filePath;
  
  // Filter for unescaped entities warnings
  const unescapedEntitiesMessages = result.messages.filter(msg => 
    msg.ruleId === 'react/no-unescaped-entities'
  );
  
  if (unescapedEntitiesMessages.length > 0) {
    console.log(`\nProcessing ${filePath}:`);
    console.log(`Found ${unescapedEntitiesMessages.length} unescaped entities`);
    
    // Read the file content
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Process each unescaped entity warning
    unescapedEntitiesMessages.forEach(msg => {
      // Extract line and column from message
      const { line, column } = msg;
      console.log(`  - Line ${line}, Column ${column}`);
      
      // Get the line content
      const lines = fileContent.split('\n');
      const lineContent = lines[line - 1];
      
      // Replace unescaped entities based on the warning message
      let newLineContent = lineContent;
      
      // Handle different types of unescaped entities
      if (msg.message.includes(`'`)) {
        // Replace single quotes with &apos;
        // We need to be careful to only replace unescaped quotes in JSX
        newLineContent = lineContent.substring(0, column) + 
                         lineContent.substring(column).replace(/'/g, '&apos;');
      } 
      else if (msg.message.includes(`"`)) {
        // Replace double quotes with &quot;
        newLineContent = lineContent.substring(0, column) + 
                         lineContent.substring(column).replace(/"/g, '&quot;');
      }
      
      if (newLineContent !== lineContent) {
        lines[line - 1] = newLineContent;
        fileContent = lines.join('\n');
        modified = true;
        entitiesFixed++;
      }
    });
    
    // Write back the modified content
    if (modified) {
      fs.writeFileSync(filePath, fileContent, 'utf8');
      filesModified++;
    }
  }
});

console.log(`\nCompleted! Modified ${filesModified} files and fixed ${entitiesFixed} unescaped entities.`);
console.log('Note: Please review the changes as they may affect the appearance of text in your components.'); 