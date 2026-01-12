const STATIC_CACHE = 'tempora-static-v10';
const API_CACHE = 'tempora-api-v10';

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
    './images/favicon_io/apple-touch-icon.png',
    // --- Fondos dinámicos añadidos ---
    './images/backgrounds/sunDay.webm',
    './images/backgrounds/cloudyDay.webp',
    './images/backgrounds/rainDay.webm',
    './images/backgrounds/snowDay.webm',
    './images/backgrounds/stormDay.webm',
    './images/backgrounds/starsNight.webm',
    './images/backgrounds/cloudyNight.webm',
    './images/backgrounds/rainNight.webm',
    './images/backgrounds/snowNight.webm',
    './images/backgrounds/stormNight.webm'
];

// ... (manten tus constantes STATIC_FILES arriba)

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(async (cache) => {
            // Primero añadimos los archivos críticos (HTML, JS, CSS)
            const criticos = STATIC_FILES.filter(file => !file.endsWith('.webm') && !file.endsWith('.webp'));
            await cache.addAll(criticos);

            // Luego intentamos añadir los videos uno a uno para evitar el error 206
            const videos = STATIC_FILES.filter(file => file.endsWith('.webm') || file.endsWith('.webp'));
            
            return Promise.allSettled(
                videos.map(video => 
                    fetch(video)
                        .then(res => {
                            if (res.ok) return cache.put(video, res);
                        })
                        .catch(err => console.log("Fallo al cachear video:", video, err))
                )
            );
        })
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
    // 1. Estrategia para la API (Network First, con fallback a caché)
    if (event.request.url.includes('api.open-meteo.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
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

    // 2. Estrategia Stale-While-Revalidate para archivos de la App
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.ok) {
                    const copy = networkResponse.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
                }
                return networkResponse;
            }).catch(() => {
                // Silencio: error de red, ya tenemos la caché (si existe)
            });

            return cachedResponse || fetchPromise;
        })
    );
});