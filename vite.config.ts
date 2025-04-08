/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";
import basicSsl from '@vitejs/plugin-basic-ssl';
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
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
   // root: path.resolve(__dirname, "client"), // REMOVED - Vite root is now project root
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
