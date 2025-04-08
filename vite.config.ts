/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";
import basicSsl from '@vitejs/plugin-basic-ssl';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import { Plugin } from 'vite';

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
          fs.copyFileSync(srcPath, destPath);
        }
      }

      console.log('✅ Public files copied to dist directory');
    }
  };
}

export default defineConfig({
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
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    }
   },
   optimizeDeps: {
     include: ['jspdf'],
   },
   build: {
    // Input is implicitly index.html at project root
    outDir: path.resolve(__dirname, "dist"), // Output relative to project root
    emptyOutDir: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/')) {
              return 'vendor-core';
            } else if (id.includes('recharts') || id.includes('chart.js')) {
              return 'vendor-charting';
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Path is relative to project root
    setupFiles: './client/src/setupTests.ts',
  },
});
