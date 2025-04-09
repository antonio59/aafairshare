// Service Worker for AAFairShare PWA

const CACHE_NAME = 'fairshare-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './favicon.svg'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.warn('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Early check for non-HTTP/HTTPS requests (like chrome-extension:// URLs)
  try {
    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      // Skip service worker for non-HTTP/HTTPS requests
      return;
    }
  } catch (e) {
    console.error('Invalid URL in initial fetch check:', e);
    return;
  }
  // Skip for Firebase auth and Firestore requests
  // Use URL object for safer parsing and validation
  try {
    const url = new URL(event.request.url);

    // Define an allowlist of trusted domains that should bypass the cache
    const bypassCacheDomains = [
      'firebaseapp.com',
      'googleapis.com',
      'firebase-settings.crashlytics.com',
      'firebase.google.com',
      'firestore.googleapis.com'
    ];

    // Check if the hostname matches any of our trusted domains
    const shouldBypassCache = bypassCacheDomains.some(domain => {
      // Use exact domain matching or proper subdomain checking
      return url.hostname === domain || url.hostname.endsWith(`.${domain}`);
    });

    if (shouldBypassCache) {
      return; // Skip caching for these domains
    }
  } catch (e) {
    console.error('Invalid URL in fetch handler:', e);
    return;
  }

  // Only handle GET requests - other methods shouldn't be cached
  if (event.request.method !== 'GET') {
    return;
  }

  // Additional URL validation for the request we're about to cache/fetch
  try {
    const requestUrl = new URL(event.request.url);

    // Only cache same-origin requests to prevent potential security issues
    const isSameOrigin = requestUrl.origin === self.location.origin;

    // Only proceed with caching for same-origin requests or specific allowed external resources
    if (!isSameOrigin) {
      // You could add exceptions here for CDNs or other trusted external resources
      // For now, we'll just skip caching for non-same-origin requests
      return fetch(event.request);
    }

    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // Clone the request
          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(
            response => {
              // Check if valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  // Additional security check before caching
                  // Only cache http/https URLs (not chrome-extension, file, etc.)
                  const validProtocols = ['http:', 'https:'];
                  if (validProtocols.includes(requestUrl.protocol) &&
                      (requestUrl.protocol === 'https:' || requestUrl.hostname === 'localhost')) {
                    cache.put(event.request, responseToCache);
                  }
                }).catch(error => {
                  console.error('Cache put error:', error);
                  // Continue without caching
                });

              return response;
            }
          ).catch(error => {
            console.error('Fetch failed:', error);
            // You could return a custom offline page here
            return new Response('Network error occurred', { status: 503, statusText: 'Service Unavailable' });
          });
        })
    );
  } catch (e) {
    console.error('Error in fetch handler:', e);
    return;
  }
});
