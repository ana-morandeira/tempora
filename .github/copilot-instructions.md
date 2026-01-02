## Propósito
Instrucciones breves para agentes IA que trabajen en este repo: identificar arquitectura, flujos de datos, puntos de integración y convenciones específicas.

## Resumen / Big picture
- Proyecto: sitio web estático PWA (single-page) que consume la API de Open-Meteo.
- Frontend ligero: HTML + CSS en [index.html](index.html) y [styles/index.css](styles/index.css).
- Lógica principal en [services/script.js](services/script.js): inicialización, geocodificación, fetch a Open-Meteo, render de UI y gráficas con Chart.js.
- PWA: manifest en [services/manifest.json](services/manifest.json) y service worker en [sw.js](sw.js) para cache estático y respuesta a llamadas a `api.open-meteo.com`.

## Componentes clave y responsabilidades
- [index.html](index.html): estructura DOM y canvases `#hourlyChart`, `#dailyChart` — puntos donde se inyecta JS.
- [services/script.js](services/script.js): clase `WeatherApp` controla flujo: geocoding → fetch de forecast → display + render de gráficas. Buscar métodos: `geocodeCity`, `fetchWeatherData`, `renderHourlyChart`, `renderDailyChart`.
- [sw.js](sw.js): cache estático (`tempora-static-v1`) y cache de API (`tempora-api-v1`). El service worker cachea respuestas de `api.open-meteo.com` cuando están disponibles.
- [services/manifest.json](services/manifest.json): PWA metadata — actualizar icons/start_url si cambian rutas.

## Patrones y convenciones del repositorio
- Código JS es ES6+ orientado a objetos; la app crea `new WeatherApp()` en `DOMContentLoaded`.
- Manejo de estados UI con clases CSS (`.hidden`): para mostrar/ocultar secciones se usa `classList` (ver `showLoading`, `hideLoading`, `showError`). Evitar manipular `innerHTML` masivo salvo en `displayForecast`.
- Chart.js se carga desde CDN en [index.html](index.html). Las funciones de render esperan que `Chart` y opcionalmente `ChartDataLabels` estén disponibles globalmente.
- Service worker comentado en `services/script.js` — si se activa, registrar usando ruta absoluta `/sw.js`.

## Flujo de datos importante
1. Usuario ingresa ciudad o solicita geolocalización → `geocodeCity` o `getCurrentLocation`.
2. Se llama a `https://api.open-meteo.com/...` desde `fetchWeatherData` → respuesta JSON con `current`, `hourly`, `daily`.
3. `displayCurrentWeather` actualiza DOM; `renderHourlyChart` y `renderDailyChart` construyen gráficas en `#hourlyChart` y `#dailyChart`.
4. `sw.js` intenta cachear llamadas a `api.open-meteo.com` y sirve caché en fallback.

## Cómo ejecutar y probar localmente (rápido)
- Servir en HTTP (evitar problemas de geolocation / service worker):

```bash
# Python 3
python -m http.server 8000

# o con node
npx serve . -p 8000
```

- Abrir `http://localhost:8000/index.html` y usar consola para ver errores. Geolocalización requiere HTTPS; en local puede fallar si no se usa `localhost`/secure context.

## Qué buscar al editar código
- Cuando modifiques `fetchWeatherData`, conserva la estructura esperada: respuesta con `current`, `hourly`, `daily` y campos nombrados como en Open-Meteo (ej.: `temperature_2m`, `apparent_temperature`, `precipitation`).
- Al cambiar nombres de IDs en el DOM, actualiza todas las referencias en `services/script.js` (p. ej. `currentTemp`, `hourlyChart`, `dailyChart`).
- Si actualizas librerías (Chart.js), prueba la existencia de `Chart` y `ChartDataLabels` antes de usar plugins.

## Recomendaciones para PRs y commits
- PRs pequeños por responsabilidad (UI, datos, PWA). Incluir capturas si cambian vistas o gráficas.
- Añadir nota si el cambio requiere invalidar cache del service worker (incrementar `tempora-static-v1` o `tempora-api-v1` en `sw.js`).

## Ejemplos concretos
- Para añadir una nueva métrica horaria: extender la URL en `fetchWeatherData` y acceder a `data.hourly.<new_metric>`; actualizar `renderHourlyChart` para incluir un nuevo dataset.
- Para cambiar iconos PWA, editar rutas en [services/manifest.json](services/manifest.json) y añadir archivos en `images/`.

## Limitaciones detectadas (observables en el código)
- `README.md` está vacío; no hay tests automáticos ni pipeline de build en el repo.
- Geolocation usa `navigator.geolocation` que necesitará HTTPS para funcionar fuera de `localhost`.

Si quieres, actualizo/afinó alguna sección (por ejemplo, añadir pasos para desplegar o políticas de versionado del SW). ¿Qué parte quieres que amplíe? 
