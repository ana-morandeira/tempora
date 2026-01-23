const STATIC_CACHE = 'tempora-static-v12'; 
const API_CACHE = 'tempora-api-v12';

const STATIC_FILES = [
    './',
    './index.html',
    './styles/index.css',
    './services/script.js',
    './services/history.js',      
    './services/chart.min.js',
    './services/datalabels.min.js',
    './services/manifest.json',
    './images/favicon_io/android-chrome-192x192.png',
    './images/favicon_io/android-chrome-512x512.png',
    './images/favicon_io/favicon.ico',
    './images/favicon_io/apple-touch-icon.png',
];


self.addEventListener('fetch', event => {
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

});