/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'; // Use defineConfig from vitest/config
import react from "@vitejs/plugin-react";
import basicSsl from '@vitejs/plugin-basic-ssl'; // Import the SSL plugin
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // Re-enable SSL plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  // css: { // Explicit CSS configuration removed - Vite should auto-detect postcss.config.js
  //   postcss: './postcss.config.js',
  // },
  server: {
    headers: {
      // Allow popups for OAuth flows using signInWithPopup
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      // Keep COEP relaxed for now unless specific features require 'require-corp'
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    }
   },
   optimizeDeps: { // Add optimizeDeps
     include: ['jspdf'], // Pre-bundle jspdf, removed xlsx
   },
   root: path.resolve(__dirname, "client"), // Keep root as client
   build: {
    outDir: path.resolve(__dirname, "client/dist"), // Output directly to client/dist for Firebase
    emptyOutDir: true,
    chunkSizeWarningLimit: 700, // Increase warning limit to 700 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group node_modules into specific chunks
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/')) { // More specific check for react/react-dom
              return 'vendor-core'; // Core React libs
            } else if (id.includes('recharts') || id.includes('chart.js')) {
              return 'vendor-charting'; // Charting libs
            }
            // Let Rollup handle Firebase and other dependencies automatically
            // Other node_modules will be implicitly grouped by Rollup
          }
        },
      },
    },
  },
  // Add Vitest configuration
  test: {
    globals: true, // Use Vitest global APIs
    environment: 'jsdom', // Simulate browser environment for React components
    setupFiles: './client/src/setupTests.ts', // Path to setup file (relative to root)
    // Optional: Configure CSS handling if needed (e.g., for CSS Modules)
    // css: true,
  },
});
