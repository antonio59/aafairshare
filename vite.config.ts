import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';

// CSP Headers configuration
const cspHeaders = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.firebase.com https://*.google.com https://*.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: https://www.google-analytics.com",
  "connect-src 'self' https://*.firebaseio.com https://*.cloudfunctions.net https://*.googleapis.com https://www.google-analytics.com wss://*.firebaseio.com",
  "frame-src 'self' https://*.firebaseapp.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Simplified React plugin configuration
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'firebase-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        }, {
          urlPattern: /^https:\/\/www\.google-analytics\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'analytics-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
          },
        }],
      },
    }),
  ],
  
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('chart')) return 'chart-vendor';
            return 'vendor'; // other dependencies
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    exclude: ['@jridgewell/sourcemap-codec']
  },

  preview: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
