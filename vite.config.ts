import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Read manifest.json content
const manifestContent = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf-8'));

// CSP Headers configuration
const cspHeaders = [
  "default-src 'self' https://*.github.dev https://*.app.github.dev",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.github.dev https://*.app.github.dev",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.github.dev https://*.app.github.dev",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://*.github.dev https://*.app.github.dev",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.github.dev https://*.app.github.dev https://github.dev",
  "worker-src 'self' blob:",
  "frame-src 'self' https://*.supabase.co https://*.github.dev https://*.app.github.dev",
  "manifest-src 'self' https://*.github.dev https://*.app.github.dev",
].join('; ');

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['offline.html'],
  manifest: {
    ...manifestContent,
    name: 'AA Fairshare',
    short_name: 'Fairshare',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    start_url: './',
    scope: './',
    id: '/',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets'
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'static-resources',
        }
      }
    ],
    navigateFallback: 'index.html',
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true
  },
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  }
};

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin', '@babel/plugin-transform-react-jsx']
      }
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    VitePWA(pwaOptions)
  ],
  build: {
    target: 'es2020',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 3000, // Increased due to necessary PDF/Excel libraries
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React and routing
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Backend and authentication
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Data visualization
            if (id.includes('chart.js') || id.includes('@kurkle') || id.includes('recharts')) {
              return 'vendor-charts';
            }
            // UI components and styling
            if (id.includes('tailwind') || id.includes('@headlessui') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Data handling and utilities
            if (id.includes('date-fns') || id.includes('uuid') || id.includes('validator')) {
              return 'vendor-utils';
            }
            // Security and sanitization
            if (id.includes('sanitize-html') || id.includes('xss') || id.includes('helmet')) {
              return 'vendor-security';
            }
            // File handling and exports
            if (id.includes('pdfmake') || id.includes('exceljs')) {
              return 'vendor-exports';
            }
            // State management
            if (id.includes('zustand')) {
              return 'vendor-state';
            }
            // DnD functionality
            if (id.includes('react-beautiful-dnd')) {
              return 'vendor-dnd';
            }
            // Performance monitoring
            if (id.includes('web-vitals')) {
              return 'vendor-monitoring';
            }
            // Development dependencies should be excluded from the build
            if (id.includes('eslint') || id.includes('jest') || id.includes('typescript') || id.includes('ts-node')) {
              return undefined;
            }
            // Remaining dependencies
            return 'vendor-shared';
          }
          // Split app code by feature
          if (id.includes('/src/components/')) {
            if (id.includes('/Analytics')) {
              return 'feature-analytics';
            }
            if (id.includes('/Settlement')) {
              return 'feature-settlement';
            }
            if (id.includes('/Expense')) {
              return 'feature-expenses';
            }
            if (id.includes('/Auth')) {
              return 'feature-auth';
            }
            if (id.includes('/Settings')) {
              return 'feature-settings';
            }
          }
          // Split utilities
          if (id.includes('/src/utils/')) {
            if (id.includes('auth')) {
              return 'utils-auth';
            }
            if (id.includes('security')) {
              return 'utils-security';
            }
            if (id.includes('export')) {
              return 'utils-export';
            }
          }
        },
        // Customize chunk and asset filenames
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const { ext, name } = path.parse(assetInfo.name);
          if (ext === '.css') return `assets/css/${name}-[hash]${ext}`;
          if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
            return `assets/img/${name}-[hash]${ext}`;
          }
          return `assets/${name}-[hash]${ext}`;
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'zustand'],
    exclude: ['@jridgewell/sourcemap-codec']
  },
  server: {
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()'
    }
  }
});
