/* sw.js - service worker básico con cache de assets esenciales */
const CACHE_NAME = 'distancia-v1';
const ASSETS = [
  '/',
  '/index.php',
  '/css/reset.css',
  '/css/variables.css',
  '/css/global.css',
  '/css/envelope.css',
  '/css/responsive.css',
  '/js/config.js',
  '/js/app.js',
  '/js/pwa.js',
  '/js/mathPuzzle.js',
  '/js/envelope.js',
  '/js/letter.js',
  '/manifest.json',
  '/assets/images/cover.svg',
  '/assets/images/icon-192.svg',
  '/assets/images/icon-512.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => { if(key !== CACHE_NAME) return caches.delete(key); })))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(networkRes => {
      return networkRes;
    })).catch(()=>caches.match('/'))
  );
});
