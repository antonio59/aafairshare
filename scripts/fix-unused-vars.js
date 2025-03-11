// Script to automatically prefix unused variables with an underscore
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run ESLint to get the list of unused variables
console.log('Getting list of unused variables...');
const lintOutput = execSync('npx eslint --ext .ts,.tsx src/ --format json', { encoding: 'utf8' });
const lintResults = JSON.parse(lintOutput);

// Process the lint results
let filesModified = 0;
let variablesFixed = 0;

lintResults.forEach(result => {
  const filePath = result.filePath;
  
  // Filter for unused variables warnings
  const unusedVarMessages = result.messages.filter(msg => 
    msg.ruleId === '@typescript-eslint/no-unused-vars' && 
    (msg.message.includes('is defined but never used') || 
     msg.message.includes('is assigned a value but never used'))
  );
  
  if (unusedVarMessages.length > 0) {
    console.log(`\nProcessing ${filePath}:`);
    console.log(`Found ${unusedVarMessages.length} unused variables`);
    
    // Read the file content
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Process each unused variable
    unusedVarMessages.forEach(msg => {
      // Extract the variable name using regex
      const match = msg.message.match(/'([^']+)'/);
      if (match && match[1]) {
        const varName = match[1];
        
        // Skip if already prefixed with underscore
        if (varName.startsWith('_')) return;
        
        console.log(`  - Fixing: ${varName}`);
        
        // Create a regex to find the variable declaration
        // This is a simplified approach and might not catch all cases
        const declarationRegex = new RegExp(`\\b(const|let|var|function|class)\\s+(${varName})\\b`, 'g');
        const paramRegex = new RegExp(`(\\(|,)\\s*(${varName})\\s*(:)`, 'g');
        const destructuringRegex = new RegExp(`(\\{|,)\\s*(${varName})\\s*(\\}|,|:)`, 'g');
        
        // Replace the variable name with prefixed version
        fileContent = fileContent.replace(declarationRegex, `$1 _${varName}`);
        fileContent = fileContent.replace(paramRegex, `$1 _${varName}$3`);
        
        // Handle destructuring - more complex, approach with caution
        // Note: This is a simplified approach and might not handle all cases correctly
        if (fileContent.includes(`${varName}:`)) {
          // For object property aliasing like { varName: aliasName }
          fileContent = fileContent.replace(
            new RegExp(`(\\{|,)\\s*(${varName})\\s*:\\s*([^,\\}]+)`, 'g'),
            `$1 ${varName}: _$3`
          );
        } else {
          // Standard destructuring like { varName }
          fileContent = fileContent.replace(
            new RegExp(`(\\{|,)\\s*(${varName})\\s*(\\}|,)`, 'g'),
            `$1 ${varName}: _${varName}$3`
          );
        }
        
        modified = true;
        variablesFixed++;
      }
    });
    
    // Write back the modified content
    if (modified) {
      fs.writeFileSync(filePath, fileContent, 'utf8');
      filesModified++;
    }
  }
});

console.log(`\nCompleted! Modified ${filesModified} files and fixed ${variablesFixed} unused variables.`);
console.log('Note: This script uses a simplified approach and may not catch all cases. Please review the changes.'); 