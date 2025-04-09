/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";
import basicSsl from '@vitejs/plugin-basic-ssl';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import { Plugin, UserConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



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
  // Use relative paths for assets
  base: '',
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
       'firebase',
       'firebase/app',
       'firebase/auth',
       'firebase/firestore'
     ],
     exclude: ['recharts'],
     // Force prebundling of these dependencies
     force: true
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
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create a chunk for each lazy-loaded component
          if (id.includes('LazyExpenseTable.tsx') || id.includes('LazyExpenseForm.tsx') ||
              id.includes('LazyMonthSelector.tsx') || id.includes('LazySummaryCard.tsx')) {
            return 'lazy-components';
          }

          // Create a chunk for React and related libraries
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/react-hook-form')) {
            return 'vendor-react';
          }

          // Create a chunk for Firebase
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }

          // Create a chunk for UI components
          if (id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge')) {
            return 'vendor-ui';
          }

          // Create a chunk for date handling libraries
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/react-day-picker')) {
            return 'vendor-date';
          }

          // Create a chunk for chart libraries
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }

          // Create a chunk for chart components
          if (id.includes('EnhancedDataChart.tsx') ||
              id.includes('EnhancedTrendChart.tsx')) {
            return 'chart-components';
          }

          // Create a chunk for export utilities
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas')) {
            return 'vendor-export';
          }
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
