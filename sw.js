const STATIC_CACHE = 'tempora-static-v8';
const API_CACHE = 'tempora-api-v8';

const STATIC_FILES = [
   './',
    './index.html',
    './styles/index.css',
    './services/script.js',
    './services/chart.min.js',
    './services/datalabels.min.js',
    './services/manifest.json',
    './images/favicon_io/android-chrome-192x192.png',
    './images/favicon_io/android-chrome-512x512.png',
    './images/favicon_io/favicon.ico',
    './images/favicon_io/apple-touch-icon.png'
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
    // 1. Estrategia especial para la API (Internet primero)
    if (event.request.url.includes('api.open-meteo.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                      // Dentro del fetch de la API, cambia:
                        caches.open(API_CACHE).then(cache => cache.put(event.request, copy)); 
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

  // 2. Estrategia para archivos de la App (HTML, JS, CSS, Imágenes)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Si está en caché, lo devuelve, pero lanza un fetch para actualizar la caché
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.ok) {
                    const copy = networkResponse.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
                }
                return networkResponse;
            }).catch(() => {
                // Si falla la red, no pasa nada, ya devolvimos la caché
            });

            return cachedResponse || fetchPromise;
        })
    );
}); // Fin del evento fetch