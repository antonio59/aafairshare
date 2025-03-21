#!/usr/bin/env node
/**
 * Component Standardization Script
 * 
 * This script standardizes UI component exports to follow the TypeScript-first
 * approach with React 19 compatibility.
 * 
 * Run with: node scripts/standardize-components.js
 */

const fs = require('fs');
const path = require('path');

const UI_COMPONENTS_DIR = path.resolve(__dirname, '../src/components/ui');

// Template for standardized component exports
const generateStandardExportCode = (
  componentName,
  originalCode
) => {
  // Extract the component implementation
  const componentRegex = new RegExp(`export const ${componentName} = (React\\.forwardRef|forwardRef)?\\s*\\(`);
  const match = originalCode.match(componentRegex);
  
  if (!match) {
    console.log(`Could not find component implementation for ${componentName}`);
    return originalCode;
  }
  
  // Find the component implementation and replace the export
  const updatedCode = originalCode.replace(
    new RegExp(`export const ${componentName} = (.*?\\([\\s\\S]*?\\))\\s*${componentName}\\.displayName = ["']${componentName}["'];?\\s*(// This lowercase export is needed for GitHub workflow validation\\s*// Using the same implementation to avoid duplication\\s*export const ${componentName.toLowerCase()} = ${componentName})?`, 'g'),
    (_, implementation) => {
      return `import { createComponentExports } from "@/lib/component-utils"

const ${componentName}Component = $1

// Create standardized exports (PascalCase and lowercase)
const { PascalCase: ${componentName}, lowercase: ${componentName.toLowerCase()} } = createComponentExports(${componentName}Component, "${componentName}")

// Export both versions
export { ${componentName}, ${componentName.toLowerCase()} }`;
    }
  );
  
  return updatedCode;
};

// Get proper component name from file name (e.g., 'dropdown-menu.tsx' -> 'DropdownMenu')
const getComponentNameFromFile = (fileName) => {
  return fileName
    .replace(/\.tsx$/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

// Process all UI component files
const processComponentFiles = () => {
  const files = fs.readdirSync(UI_COMPONENTS_DIR);
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  files.forEach(file => {
    if (!file.endsWith('.tsx')) return;
    
    const filePath = path.join(UI_COMPONENTS_DIR, file);
    const componentName = getComponentNameFromFile(file);
    
    console.log(`Processing ${componentName} in ${file}...`);
    
    const originalCode = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already using the standardized pattern
    if (originalCode.includes('createComponentExports')) {
      console.log(`${componentName} already uses standardized exports`);
      skippedCount++;
      return;
    }
    
    try {
      // Generate standardized code
      const updatedCode = generateStandardExportCode(componentName, originalCode);
      
      // Write updated code back to file
      if (updatedCode !== originalCode) {
        fs.writeFileSync(filePath, updatedCode);
        console.log(`✅ Updated ${componentName}`);
        updatedCount++;
      } else {
        console.log(`⏭️ No changes needed for ${componentName}`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${componentName}:`, error.message);
      errorCount++;
    }
  });
  
  return { updatedCount, skippedCount, errorCount };
};

console.log('🚀 Starting component standardization...');
const { updatedCount, skippedCount, errorCount } = processComponentFiles();
console.log('✨ Component standardization complete!');
console.log(`📊 Summary: ${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors`);

// Check if any components were updated
if (updatedCount > 0) {
  console.log('\n🔍 Next steps:');
  console.log('1. Review the changes to ensure they are correct');
  console.log('2. Run tests to verify component functionality');
  console.log('3. Update any imports if necessary');
} else if (errorCount > 0) {
  console.log('\n⚠️ Some components had errors during processing. Check the logs above.');
} else {
  console.log('\n✅ All components are already using the standardized export pattern!');
}
