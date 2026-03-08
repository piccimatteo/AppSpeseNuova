// Service Worker for MPfinTraker PWA
// Cache-first for static assets, network-first for API calls

const CACHE_NAME = 'mpfintraker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for everything else
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and cross-origin requests (e.g. Firestore)
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Firebase API calls — network first, no caching
  if (url.hostname === 'firestore.googleapis.com' ||
      url.hostname.endsWith('.firestore.googleapis.com') ||
      url.hostname === 'firebase.googleapis.com' ||
      url.hostname.endsWith('.firebase.googleapis.com') ||
      url.hostname === 'googleapis.com' ||
      url.hostname.endsWith('.googleapis.com') ||
      url.hostname === 'firebaseapp.com' ||
      url.hostname.endsWith('.firebaseapp.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Static assets — cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful same-origin responses
        if (response.ok && url.origin === self.location.origin) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 503 });
      });
    })
  );
});
