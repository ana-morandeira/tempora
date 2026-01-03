class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.hourlyChart = null;
        this.dailyChart = null;
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        this.updateCurrentDate();
        this.getCurrentLocation();
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => {
            const city = document.getElementById('cityInput').value.trim();
            if (city) this.searchByCity(city);
        });

        document.getElementById('cityInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const city = e.target.value.trim();
                if (city) this.searchByCity(city);
            }
        });

        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });
    }

    updateCurrentDate() {
        const now = new Date();
        document.getElementById('currentDate').textContent =
            now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
     
        // El ID 'charts' debe englobar tus dos canvas en el HTML
        const charts = document.getElementById('charts');
        if (charts) charts.classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.querySelector('p').textContent = `❌ ${message}`;
        errorDiv.classList.remove('hidden');
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
            document.getElementById('locationName').textContent = `📍 Ubicación actual`;
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
            document.getElementById('locationName').textContent = `📍 ${coords.name}`;
            document.getElementById('cityInput').value = '';
        } catch {
            this.showError('Error al buscar la ciudad');
        }
    }

    async geocodeCity(city) {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es`
        );
        const data = await res.json();
        if (!data.results?.length) return null;
        const r = data.results[0];
        return {
            lat: r.latitude,
            lon: r.longitude,
            name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ', ' + r.country : ''}`
        };
    }
async fetchWeatherData(lat, lon) {
    try {
        this.showLoading(); // Muestra el spinner
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=15&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        // --- PASO 1: MOSTRAR CONTENEDORES ---
        // Lo hacemos primero para que Chart.js tenga espacio para dibujar
        document.getElementById('currentWeather').classList.remove('hidden');
        document.getElementById('charts').classList.remove('hidden');

        // --- PASO 2: ACTUALIZAR DATOS ---
        this.displayCurrentWeather(data.current);
        this.updateBackgroundImage(data.current.weather_code);

        // --- PASO 3: RENDERIZAR GRÁFICAS (con seguro) ---
        if (typeof Chart !== 'undefined') {
            try {
                this.renderHourlyChart(data.hourly);
                this.renderDailyChart(data.daily);
            } catch (chartError) {
                console.error("Error en las gráficas:", chartError);
            }
        }

        // Actualizar hora de actualización
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error("Error general:", error);
        this.showError('No se pudo obtener el clima');
    } finally {
        this.hideLoading();
    }
}
displayCurrentWeather(c) {
    // 1. Datos principales
    document.getElementById('currentTemp').textContent = `${Math.round(c.temperature_2m)}°C`;
    
    const info = this.getWeatherInfo(c.weather_code);
    document.getElementById('weatherIcon').textContent = info.icon;
    document.getElementById('weatherDescription').textContent = info.description;

    // 2. Mini-cards (Detalles técnicos)
    document.getElementById('feelsLike').textContent = `${Math.round(c.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${c.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${c.wind_speed_10m} km/h`;
    document.getElementById('visibility').textContent = `${(c.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${c.surface_pressure} hPa`;
    document.getElementById('precipitation').textContent = `${c.precipitation} mm`;

    
}
  renderHourlyChart(hourly) {
    // 1. Mapeo de códigos a iconos (puedes añadir más si quieres)
    const weatherIcons = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 
        48: '🌫️', 51: '🌧️', 61: '🌧️', 80: '🌦️', 95: '⛈️'
    };

    // Tomamos las 48 horas de tiempo, temperaturas y códigos de clima
    const labels = hourly.time.slice(0, 48).map(t => `${new Date(t).getHours()}h`);
    const temps = hourly.temperature_2m.slice(0, 48);
    const codes = hourly.weather_code.slice(0, 48);

    if (this.hourlyChart) this.hourlyChart.destroy();

    this.hourlyChart = new Chart(document.getElementById('hourlyChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temps,
                borderColor: '#001a33', // Azul oscuro para contraste
                backgroundColor: 'rgba(0, 26, 51, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0, // Quitamos el punto para que no estorbe al icono
                pointHitRadius: 20 // Pero permitimos que se pueda tocar para ver el valor
            }]
        },
        plugins: [ChartDataLabels], // Importante: tener el plugin activado
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 30, bottom: 10, left: 10, right: 10 }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    // MOSTRAMOS ICONO CADA 3 HORAS para que sea legible en móviles
                    display: (context) => context.dataIndex % 3 === 0,
                    formatter: (value, context) => {
                        const code = codes[context.dataIndex];
                        return weatherIcons[code] || '🌡️';
                    },
                    align: 'top',
                    offset: 5,
                    font: { size: 16 },
                    color: '#001a33'
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        // MOSTRAMOS LA HORA CADA 6 HORAS en el eje X para el responsive
                        callback: function(val, index) {
                            return index % 6 === 0 ? this.getLabelForValue(val) : '';
                        },
                        color: '#001a33'
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#001a33' }
                }
            }
        }
    });
}

    renderDailyChart(daily) {
        const labels = daily.time.map(d => new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
        const icons = daily.weather_code.map(code => this.getWeatherIcon(code));

        if (this.dailyChart) this.dailyChart.destroy();

        const canvas = document.getElementById('dailyChart');
        if (!canvas) return;

        this.dailyChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Máx',
                        data: daily.temperature_2m_max,
                        backgroundColor: '#4A90E2',
                        borderRadius: 5
                    },
                    {
                        label: 'Mín',
                        data: daily.temperature_2m_min,
                        backgroundColor: '#7B68EE',
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        display: !!window.ChartDataLabels,
                        anchor: 'end',
                        align: 'top',
                        formatter: (val, ctx) => ctx.datasetIndex === 0 ? icons[ctx.dataIndex] : ''
                    }
                }
            },
            plugins: window.ChartDataLabels ? [window.ChartDataLabels] : []
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

    // --- NUEVO: FUNCIÓN PARA CAMBIAR EL FONDO GIF ---
    updateBackgroundImage(code) {
        const body = document.body;
        // Mapeo de códigos Open-Meteo a tus archivos GIF
        const backgrounds = {
            0: 'despejado.gif',
            1: 'nubes.gif', 
            2: 'nubes.gif',
            3: 'nublado.gif',
            45: 'niebla.gif',
            61: 'lluvia.gif',
            71: 'nieve.gif',
            95: 'tormenta.gif'
        };

        const fileName = backgrounds[code] || 'despejado.gif';
        // Asegúrate de que la carpeta y nombres coincidan
        body.style.backgroundImage = `url('images/backgrounds/${fileName}')`;
    }
} // <--- AQUÍ CIERRA LA CLASE WeatherApp

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => { 
    new WeatherApp(); 
});

/* REGISTRO DEL SERVICE WORKER (DESACTIVADO)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
*/
