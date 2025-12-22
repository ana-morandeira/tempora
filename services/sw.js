const STATIC_CACHE = 'tempora-static-v1';
const API_CACHE = 'tempora-api-v1';

const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles/index.css',
    '/script.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => ![STATIC_CACHE, API_CACHE].includes(k))
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const req = event.request;

    if (req.url.includes('api.open-meteo.com')) {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(API_CACHE).then(c => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    event.respondWith(
        caches.match(req).then(cached => cached || fetch(req))
    );
});

