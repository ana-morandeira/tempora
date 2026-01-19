const STATIC_CACHE = 'tempora-static-v12'; // 🆙 Subimos a v11
const API_CACHE = 'tempora-api-v12';

const STATIC_FILES = [
    './',
    './index.html',
    './styles/index.css',
    './services/script.js',
    './services/history.js',      // ✨ Añadimos el nuevo archivo
    './services/chart.min.js',
    './services/datalabels.min.js',
    './services/manifest.json',
    './images/favicon_io/android-chrome-192x192.png',
    './images/favicon_io/android-chrome-512x512.png',
    './images/favicon_io/favicon.ico',
    './images/favicon_io/apple-touch-icon.png',
    // ... mantén aquí todos tus webm y webp igual que antes
];

// ... (El bloque de install y activate se queda IGUAL)

self.addEventListener('fetch', event => {
    // 1. Estrategia para las APIS (Forecast y Archive)
    // Cambiamos el filtro para que incluya cualquier subdominio de open-meteo
    if (event.request.url.includes('open-meteo.com')) { 
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
    // (El resto del código se queda IGUAL)
});