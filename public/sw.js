const CACHE_NAME = 'internship-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/assets/images/Background.webp',
  '/assets/images/garuda-logo.png',
  '/assets/images/garuda-logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k))))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Network-first for API, cache-first for others
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
    )
  );
});


