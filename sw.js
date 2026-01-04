const STATIC_CACHE = 'tempora-static-v1';
const API_CACHE = 'tempora-api-v1';

const STATIC_FILES = [
   './',
    './index.html',
    './styles/index.css',
    './services/script.js',
    './services/manifest.json'
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

// Reemplaza tu event listener de 'fetch' por este:
self.addEventListener('fetch', event => {
    if (event.request.url.includes('api.open-meteo.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Solo cacheamos si la respuesta es válida
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(API_CACHE).then(cache => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});