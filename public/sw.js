// Block Smash Puzzle — Service Worker v2.0.0
const CACHE_NAME = 'block-smash-v2.0.0';
const ASSETS = [
  '/',
  '/index.html',
  '/game.js',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/privacy.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first for API calls
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' }}))
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return resp;
    }))
  );
});
