/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";
import basicSsl from '@vitejs/plugin-basic-ssl';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import { Plugin, UserConfig } from 'vite';
import { createFilter } from '@rollup/pluginutils';
import lodashPlugin from './lodash-plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom plugin to handle lodash imports
function fixLodashImports(): Plugin {
  const filter = createFilter(/\.jsx?$|\.tsx?$/);

  return {
    name: 'fix-lodash-imports',
    transform(code, id) {
      if (!filter(id)) return null;

      // Check if the file imports from lodash/get or similar
      if (code.includes("from 'lodash/") || code.includes('from "lodash/')) {
        // Replace imports like: import get from 'lodash/get'
        // With: import { get } from 'lodash'
        const newCode = code.replace(/import\s+([\w$]+)\s+from\s+['"]lodash\/([\w$]+)['"];?/g,
          'import { $2 as $1 } from "lodash";');

        if (newCode !== code) {
          return {
            code: newCode,
            map: null
          };
        }
      }
      return null;
    }
  };
}

// Custom plugin to handle react-is imports
function fixReactIsImports(): Plugin {
  const filter = createFilter(/\.jsx?$|\.tsx?$/);

  return {
    name: 'fix-react-is-imports',
    transform(code, id) {
      if (!filter(id)) return null;

      // Check if the file imports from react-is
      if (code.includes("from 'react-is'") || code.includes('from "react-is"')) {
        // Make sure named imports are properly handled
        return {
          code,
          map: null
        };
      }
      return null;
    }
  };
}

// Custom plugin to copy files from public to dist
function copyPublicFiles(): Plugin {
  return {
    name: 'copy-public-files',
    closeBundle: async () => {
      const distDir = path.resolve(__dirname, 'dist');
      const publicDir = path.resolve(__dirname, 'public');

      // Create icons directory if it doesn't exist
      const iconsDistDir = path.resolve(distDir, 'icons');
      if (!fs.existsSync(iconsDistDir)) {
        fs.mkdirSync(iconsDistDir, { recursive: true });
      }

      // Copy icons
      const iconsDir = path.resolve(publicDir, 'icons');
      if (fs.existsSync(iconsDir)) {
        const iconFiles = fs.readdirSync(iconsDir);
        for (const file of iconFiles) {
          const srcPath = path.resolve(iconsDir, file);
          const destPath = path.resolve(iconsDistDir, file);
          fs.copyFileSync(srcPath, destPath);
        }
      }

      // Copy individual files
      const filesToCopy = [
        'apple-touch-icon.png',
        'favicon.svg',
        'manifest.json',
        'service-worker.js'
      ];

      for (const file of filesToCopy) {
        const srcPath = path.resolve(publicDir, file);
        const destPath = path.resolve(distDir, file);
        if (fs.existsSync(srcPath)) {
          try {
            // Special handling for manifest.json
            if (file === 'manifest.json') {
              // Read the manifest file
              const content = fs.readFileSync(srcPath, 'utf8');
              // Parse and validate JSON
              const manifestData = JSON.parse(content);
              // Write the validated JSON with proper formatting
              fs.writeFileSync(destPath, JSON.stringify(manifestData, null, 2));
              console.log(`✅ Validated and wrote ${file}`);
            } else {
              // Normal file copy for non-manifest files
              fs.copyFileSync(srcPath, destPath);
              console.log(`✅ Copied ${file}`);
            }
          } catch (error) {
            console.error(`❌ Error processing ${file}:`, error);
          }
        } else {
          console.warn(`⚠️ File not found: ${srcPath}`);
        }
      }

      console.log('✅ Public files copied to dist directory');
    }
  };
}

export default defineConfig({
  // Use default base URL
  base: '/',
  plugins: [
    react(),
    basicSsl(),
    copyPublicFiles(),
  ],
  resolve: {
    alias: {
      // Alias paths are now relative to project root
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      // Direct aliases for problematic lodash modules
      "lodash/upperFirst": path.resolve(__dirname, "lodash-shims", "upperFirst.js"),
      "lodash/isNaN": path.resolve(__dirname, "lodash-shims", "isNaN.js"),
      "lodash/flatMap": path.resolve(__dirname, "lodash-shims", "flatMap.js"),
      "lodash/get": path.resolve(__dirname, "lodash-shims", "get.js"),
    },
  },
  server: {
    headers: {
      // Allow popups to be closed by the opener
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    }
   },
   optimizeDeps: {
     // Simplified dependency optimization
     include: [
       'react',
       'react-dom',
       'react-is',
       'firebase',
       'firebase/app',
       'firebase/auth',
       'firebase/firestore',
       'lodash'
     ],
     exclude: ['recharts'],
     // Force prebundling of these dependencies
     force: true,
     esbuildOptions: {
       // Node.js global to browser globalThis
       define: {
         global: 'globalThis'
       }
     }
   },
  build: {
    // Input is implicitly index.html at project root
    outDir: path.resolve(__dirname, "dist"), // Output relative to project root
    emptyOutDir: true,
    chunkSizeWarningLimit: 700,
    // Simplified build configuration for maximum compatibility
    sourcemap: false,
    minify: true,
    // Ensure proper CommonJS/ESM interop
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      // Fix for lodash submodule imports
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // Explicitly handle lodash submodules
      strictRequires: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and related libraries into a separate chunk
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
            'react-hook-form',
            '@hookform/resolvers',
            'react-is'
          ],
          // Firebase chunk
          'vendor-firebase': [
            'firebase',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore'
          ],
          // UI components and libraries
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'tailwindcss-animate'
          ],
          // Date handling libraries
          'vendor-date': [
            'date-fns',
            'react-day-picker'
          ],
          // Chart and visualization libraries
          'vendor-charts': [
            'recharts',
            'd3-array',
            'd3-scale',
            'd3-shape'
          ],
          // Export utilities
          'vendor-export': [
            'jspdf',
            'jspdf-autotable',
            'html2canvas'
          ]
        },
        // Ensure chunks have consistent names between builds
        chunkFileNames: 'assets/[name]-[hash].js',
        // Prevent inlining dynamic imports
        inlineDynamicImports: false
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Path is relative to project root
    setupFiles: './client/src/setupTests.ts',
  },
});
