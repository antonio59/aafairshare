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
      '@': path.resolve(__dirname, '../../src')
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
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      external: process.env.NODE_ENV === 'production' ? [] : undefined,
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            return 'vendor';
          }
          if (id.includes('.worker.')) return 'workers';
          if (id.includes('features/')) return 'features';
          if (id.includes('core/')) return 'core';
          return null;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
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
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
    exclude: [],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'node-globals',
          setup(build) {
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
    format: 'es'
  }
});