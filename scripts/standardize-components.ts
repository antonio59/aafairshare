#!/usr/bin/env ts-node
/**
 * Component Standardization Script
 * 
 * This script standardizes UI component exports to follow the TypeScript-first
 * approach with React 19 compatibility.
 * 
 * Run with: npx ts-node scripts/standardize-components.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const UI_COMPONENTS_DIR = path.resolve(__dirname, '../src/components/ui');

// Template for standardized component exports
const generateStandardExportCode = (
  componentName: string,
  originalCode: string
): string => {
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

// Process all UI component files
const processComponentFiles = () => {
  const files = fs.readdirSync(UI_COMPONENTS_DIR);
  
  files.forEach(file => {
    if (!file.endsWith('.tsx')) return;
    
    const filePath = path.join(UI_COMPONENTS_DIR, file);
    const componentName = path.basename(file, '.tsx')
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    console.log(`Processing ${componentName} in ${file}...`);
    
    const originalCode = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already using the standardized pattern
    if (originalCode.includes('createComponentExports')) {
      console.log(`${componentName} already uses standardized exports`);
      return;
    }
    
    // Generate standardized code
    const updatedCode = generateStandardExportCode(componentName, originalCode);
    
    // Write updated code back to file
    if (updatedCode !== originalCode) {
      fs.writeFileSync(filePath, updatedCode);
      console.log(`Updated ${componentName}`);
    } else {
      console.log(`No changes needed for ${componentName}`);
    }
  });
};

console.log('Starting component standardization...');
processComponentFiles();
console.log('Component standardization complete!');
