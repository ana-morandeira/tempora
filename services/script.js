class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.hourlyChart = null;
        this.dailyChart = null;
        this.initializeApp();
        this.bindEvents();
        this.startTime();
    }

    initializeApp() {
        this.updateCurrentDate();
        this.getCurrentLocation();
    }

    bindEvents() {
        const cityInput = document.getElementById('cityInput');
        const suggestions = document.getElementById('suggestions');

        // Evento para el botón de buscar
        document.getElementById('searchBtn').addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) this.searchByCity(city);
            suggestions.style.display = 'none';
        });

        // Evento para la tecla Enter
        cityInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const city = e.target.value.trim();
                if (city) this.searchByCity(city);
                suggestions.style.display = 'none';
            }
        });

        // --- LÓGICA DEL PREDICTOR ---
        cityInput.addEventListener('input', async () => {
            const query = cityInput.value.trim();
            if (query.length < 3) {
                suggestions.style.display = 'none';
                return;
            }

            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es&format=json`);
                const data = await res.json();

                if (data.results) {
                    this.renderSuggestions(data.results);
                } else {
                    suggestions.style.display = 'none';
                }
            } catch (err) {
                console.error("Error en predictor", err);
            }
        });

        // Cerrar sugerencias al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                suggestions.style.display = 'none';
            }
        });

        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });
    }

    // Método para dibujar las sugerencias
    renderSuggestions(cities) {
        const suggestions = document.getElementById('suggestions');
        const cityInput = document.getElementById('cityInput');
        suggestions.innerHTML = '';
        suggestions.style.display = 'block';

        cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            const name = `${city.name}${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}`;
            div.textContent = name;

            div.addEventListener('click', () => {
                cityInput.value = city.name;
                suggestions.style.display = 'none';
                // Usamos directamente las coordenadas para ser más rápidos
                this.fetchWeatherData(city.latitude, city.longitude);
                document.getElementById('locationName').textContent = `${name}`;
            });
            suggestions.appendChild(div);
        });
    }

    updateCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
        const charts = document.getElementById('charts');
        if (charts) charts.classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.textContent = `❌ ${message}`;
            errorDiv.classList.remove('hidden');
        }
        this.hideLoading();
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocalización no soportada');
            return;
        }
        this.showLoading();
        try {
            const position = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject)
            );
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherData(latitude, longitude);
            document.getElementById('locationName').textContent = ` Ubicación actual`;
        } catch {
            this.showError('No se pudo obtener la ubicación');
        }
    }

    async searchByCity(city) {
        this.showLoading();
        try {
            const coords = await this.geocodeCity(city);
            if (!coords) {
                this.showError('Ciudad no encontrada');
                return;
            }
            await this.fetchWeatherData(coords.lat, coords.lon);
            document.getElementById('locationName').textContent = coords.name;
            document.getElementById('cityInput').value = '';
        } catch {
            this.showError('Error al buscar la ciudad');
        }
    }

    async geocodeCity(city) {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es`);
        const data = await res.json();
        if (!data.results?.length) return null;
        const r = data.results[0];
        return {
            lat: r.latitude,
            lon: r.longitude,
            name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
        };
    }

 async fetchWeatherData(lat, lon) {
    try {
        this.showLoading();
        
        // Añadimos &timezone=auto para que la API nos devuelva el offset exacto del lugar
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,is_day,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=15&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error en la respuesta de la red");
        
        const data = await res.json();

        // --- 1. GUARDAR DATOS DE ZONA HORARIA ---
        // Guardamos el desplazamiento en segundos para el reloj internacional
        this.utcOffsetSeconds = data.utc_offset_seconds; 
        
        // --- 2. GESTIÓN DE LA INTERFAZ ---
        const weatherCont = document.getElementById('currentWeather');
        const chartsCont = document.getElementById('charts');
        
        // Quitamos el 'hidden' solo si los elementos existen
        if (weatherCont) weatherCont.classList.remove('hidden');
        if (chartsCont) chartsCont.classList.remove('hidden');

        // Pintamos los datos actuales e imagen de fondo
        this.displayCurrentWeather(data.current);
        this.updateBackgroundImage(data.current.weather_code, data.current.is_day);

        // --- 3. RENDERIZADO DE GRÁFICOS ---
        // Verificamos que Chart.js esté disponible (evita errores offline si no cargó)
        if (typeof Chart !== 'undefined') {
            this.renderHourlyChart(data.hourly);
            this.renderDailyChart(data.daily);
        }

        // --- 4. ACTUALIZACIÓN DE "ÚLTIMA HORA" ---
        // Usamos la hora calculada del destino para el texto de "Actualizado a las..."
        const lastUpdateEl = document.getElementById('lastUpdate') || document.getElementById('update-time');
        if (lastUpdateEl) {
            const now = new Date();
            const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
            const targetTime = new Date(utcTime + (this.utcOffsetSeconds * 1000));
            
            lastUpdateEl.textContent = targetTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

    } catch (error) {
        console.error("Error real en fetchWeatherData:", error);
        this.showError('Error al obtener datos climáticos');
    } finally {
        this.hideLoading();
    }
}
displayCurrentWeather(c) {
        const safeSet = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        safeSet('currentTemp', `${Math.round(c.temperature_2m)}°C`);
        
        const info = this.getWeatherInfo(c.weather_code);
        safeSet('weatherIcon', info.icon);
        safeSet('weatherDescription', info.description);
        
        safeSet('feelsLike', `${Math.round(c.apparent_temperature)}°C`);
        safeSet('humidity', `${c.relative_humidity_2m}%`);
        safeSet('windSpeed', `${c.wind_speed_10m} km/h`);
        safeSet('visibility', `${(c.visibility / 1000).toFixed(1)} km`);
        safeSet('pressure', `${c.surface_pressure} hPa`);
        safeSet('precipitation', `${c.precipitation} mm`);
    }

  renderHourlyChart(hourly) {
    const weatherIconsMap = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌧️', 61: '🌧️', 71: '❄️', 95: '⛈️' };
    const labels = hourly.time.slice(0, 24).map(t => `${new Date(t).getHours()}h`);
    
    // Datos de la API
    const temps = hourly.temperature_2m.slice(0, 24);
    const rain = hourly.precipitation ? hourly.precipitation.slice(0, 24) : new Array(24).fill(0);
    const wind = hourly.wind_speed_10m ? hourly.wind_speed_10m.slice(0, 24) : hourly.temperature_2m.slice(0, 24).map(() => 0); 
    const codes = hourly.weather_code.slice(0, 24);

    if (this.hourlyChart) this.hourlyChart.destroy();

    this.hourlyChart = new Chart(document.getElementById('hourlyChart'), {
        data: {
            labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Temp',
                    data: temps,
                    borderColor: '#ffffff',
                    borderWidth: 4,
                    yAxisID: 'y',
                    tension: 0.4,
                    pointRadius: 0,
                    order: 1
                },
                {
                    type: 'bar',
                    label: 'Lluvia (mm)',
                    data: rain,
                    backgroundColor: 'rgba(0, 217, 255, 0.6)',
                    yAxisID: 'y1',
                    borderRadius: 4,
                    order: 3
                },
                {
                    type: 'line',
                    label: 'Viento (km/h)',
                    data: wind,
                    borderColor:'#fffa81',
                    borderDash: [5, 5],
                    borderWidth: 3,
                    yAxisID: 'y1', // Comparte eje con lluvia por ser valores similares
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4,
                    order: 2
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#ffffff', usePointStyle: true, font: { size: 10 } }
                },
                datalabels: {
                    display: (ctx) => ctx.datasetIndex === 0 && ctx.dataIndex % 4 === 0,
                    formatter: (val, ctx) => `${Math.round(val)}°\n${weatherIconsMap[codes[ctx.dataIndex]] || ''}`,
                    color: '#ffffff',
                    align: 'top',
                    textAlign: 'center',
                    font: { weight: 'bold' }
                }
            },
            scales: {
                x: { ticks: { color: '#ffffff' }, grid: { display: false } },
                y: { // Eje de Temperatura
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y1: { // Eje de Lluvia/Viento
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    suggestedMax: 10,
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { display: false } // No duplicamos líneas de grid
                }
            }
        }
    });
}

    renderDailyChart(daily) {
        const labels = daily.time.map(d => new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
        if (this.dailyChart) this.dailyChart.destroy();

        this.dailyChart = new Chart(document.getElementById('dailyChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Máx', data: daily.temperature_2m_max, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 5 },
                    { label: 'Mín', data: daily.temperature_2m_min, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 5 }
                ]
            },
            plugins: [ChartDataLabels],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: '#ffffff' } },
                    y: { ticks: { color: '#ffffff' } }
                },
                plugins: {
                    legend: { labels: { color: '#ffffff' } },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (val, ctx) => ctx.datasetIndex === 0 ? this.getWeatherIcon(daily.weather_code[ctx.dataIndex]) : '',
                        color: '#ffffff'
                    }
                }
            }
        });
    }

    getWeatherInfo(code) {
        const map = { 0: ['☀️', 'Despejado'], 1: ['🌤️', 'M. Despejado'], 2: ['⛅', 'P. Nublado'], 3: ['☁️', 'Nublado'], 45: ['🌫️', 'Niebla'], 61: ['🌧️', 'Lluvia'], 71: ['🌨️', 'Nieve'], 95: ['⛈️', 'Tormenta'] };
        const r = map[code] || ['🌤️', 'N/A'];
        return { icon: r[0], description: r[1] };
    }

    getWeatherIcon(code) {
        const map = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 61: '🌧️', 71: '🌨️', 95: '⛈️' };
        return map[code] || '🌤️';
    }

    updateBackgroundImage(code, isDay) {
        const videoElement = document.getElementById('bg-video');
        const body = document.body;
        let fileName = '';

        if (isDay === 1) {
            if (code === 0) fileName = 'sunDay.webm';
            else if (code <= 3) fileName = 'cloudyDay.webp';
            else if (code >= 71 && code <= 77) fileName = 'snowDay.webm';
            else if (code >= 51 && code <= 82) fileName = 'rainDay.webm';
            else if (code >= 95) fileName = 'stormDay.webm';
            else fileName = 'sunDay.webm';
        } else {
            if (code === 0) fileName = 'starsNight.webm';
            else if (code <= 3) fileName = 'cloudyNight.webm';
            else if (code >= 71 && code <= 77) fileName = 'snowNight.webm';
            else if (code >= 51 && code <= 82) fileName = 'rainNight.webm';
            else if (code >= 95) fileName = 'stormNight.webm';
            else fileName = 'starsNight.webm';
        }

        const fullPath = `images/backgrounds/${fileName}`;

        if (fileName.endsWith('.webm')) {
            videoElement.style.display = 'block';
            videoElement.src = fullPath;
            videoElement.load();
            body.style.backgroundImage = 'none';
        } else {
            videoElement.style.display = 'none';
            body.style.backgroundImage = `url('${fullPath}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
        }
    }
    startTime() {
    const updateTime = () => {
        const el = document.getElementById('localTime');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
    };
    updateTime();
    setInterval(updateTime, 60000); // Se actualiza cada minuto
}
}

// Creamos la instancia y la hacemos global para poder usarla desde la consola
const miApp = new WeatherApp();
window.miApp = miApp;

// (Opcional) Si quieres mantener el listener de carga por seguridad:
document.addEventListener('DOMContentLoaded', () => {
    // La app ya se inició arriba, pero aquí nos aseguramos de que el DOM esté listo
    console.log("Tempora App lista y conectada a window.miApp");
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            // Caso 1: Detecta actualizaciones mientras la App está abierta
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('Nueva versión instalada. Recargando...');
                        window.location.reload();
                    }
                };
            };
        });
    });

    // Caso 2: El "Seguro de Vida". Si el Service Worker se activa, 
    // obliga a la página a refrescarse para usar el código nuevo.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            window.location.reload();
            refreshing = true;
        }
    });
}
