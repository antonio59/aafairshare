/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// Config file paths
const POSTCSS_CONFIG_PATH = path.resolve(__dirname, 'config/postcss.config.ts');
// Tailwind config should be referenced in postcss.config.ts

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx']
      }
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // Ensure Web Workers are properly handled
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('.worker.')) {
            return 'workers';
          }
          return null;
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false,
      allow: ['..']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  // Add Node.js polyfills for browser compatibility
  define: {
    'process.env': {}
  },
  // Provide node polyfills and include dependencies
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'node-globals',
          setup(build) {
            // Provide empty shims for Node.js globals
            build.onResolve({ filter: /^(stream|util|events|crypto|fs|path|buffer)$/ }, args => {
              return { path: args.path, namespace: 'node-globals' };
            });
            build.onLoad({ filter: /.*/, namespace: 'node-globals' }, () => {
              return { contents: 'export default {}' };
            });
          }
        }
      ]
    }
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  },
  worker: {
    format: 'es' // Use ES modules for workers
  }
}); 