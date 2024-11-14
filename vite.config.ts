import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Read manifest.json content
const manifestContent = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf-8'));

// CSP Headers configuration - with GitHub Codespaces support
const cspHeaders = [
  "default-src 'self' https://*.github.dev https://*.app.github.dev",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.github.dev https://*.app.github.dev",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.github.dev https://*.app.github.dev",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.googleapis.com https://storage.googleapis.com https://*.firebasestorage.app https://*.github.dev https://*.app.github.dev",
  "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://*.firebasestorage.app https://*.github.dev https://*.app.github.dev https://github.dev https://storage.googleapis.com",
  "worker-src 'self' blob:",
  "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com https://*.github.dev https://*.app.github.dev",
  "manifest-src 'self' https://*.github.dev https://*.app.github.dev",
].join('; ');

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['offline.html'],
  manifest: {
    ...manifestContent,
    start_url: './',
    scope: './',
    id: '/',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    cleanupOutdatedCaches: true,
    sourcemap: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
        },
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
        },
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
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    VitePWA(pwaOptions),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCase',
    },
    devSourcemap: true,
  },
  
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-Custom-Header',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
  },

  build: {
    target: 'esnext',
    modulePreload: true,
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo: { name?: string }) => {
          const info = assetInfo.name ?? '';
          const extType = info.split('.').at(1) ?? '';
          
          if (/png|jpe?g|svg|gif|tiff|bmp/i.test(extType)) {
            return `assets/img/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'zustand-vendor': ['zustand']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'zustand'],
    exclude: ['@jridgewell/sourcemap-codec']
  },

  preview: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-Custom-Header',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
  }
});
