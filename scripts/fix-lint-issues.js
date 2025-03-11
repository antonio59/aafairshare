const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run ESLint fix for auto-fixable issues
console.log('Running ESLint auto-fix...');
try {
  execSync('npx eslint --ext .ts,.tsx --fix src/', { stdio: 'inherit' });
  console.log('ESLint auto-fix completed successfully');
} catch (error) {
  console.error('ESLint auto-fix encountered some issues, but continuing with the script');
}

// Prefix unused variables with underscore
function prefixUnusedVariables(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regular expressions to find common patterns of unused variables
  const unusedVarRegex = /'([a-zA-Z0-9]+)' is (defined but never used|assigned a value but never used)/g;
  const matches = [...content.matchAll(unusedVarRegex)];
  
  if (matches.length > 0) {
    console.log(`Found ${matches.length} unused variables in ${filePath}`);
    
    // Create a set of variable names to avoid duplicates
    const unusedVars = new Set(matches.map(match => match[1]));
    
    // Read the actual source file
    let sourceFile = filePath.replace('.lint-report', '');
    if (!fs.existsSync(sourceFile)) {
      console.log(`Source file not found: ${sourceFile}`);
      return;
    }
    
    let sourceContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Replace variable declarations
    for (const varName of unusedVars) {
      // Don't prefix if already prefixed
      if (varName.startsWith('_')) continue;
      
      // Replace variable declarations with prefixed versions
      // This is a simple replacement and might not catch all cases
      const varRegex = new RegExp(`\\b(const|let|var|function|class|interface)\\s+${varName}\\b`, 'g');
      sourceContent = sourceContent.replace(varRegex, `$1 _${varName}`);
      
      // Replace in function parameters
      const paramRegex = new RegExp(`\\((.*?)\\b${varName}\\b(.*?)\\)`, 'g');
      sourceContent = sourceContent.replace(paramRegex, (match, before, after) => {
        return `(${before}_${varName}${after})`;
      });
    }
    
    fs.writeFileSync(sourceFile, sourceContent, 'utf8');
    console.log(`Updated ${sourceFile}`);
  }
}

// Fix import order issues by using ESLint's --fix option
console.log('Fixing import order issues...');
try {
  execSync('npx eslint --ext .ts,.tsx --fix --rule "import/order: error" src/', { stdio: 'inherit' });
  console.log('Import order fix completed successfully');
} catch (error) {
  console.error('Import order fix encountered some issues, but continuing with the script');
}

console.log('Lint fixing script completed.'); 