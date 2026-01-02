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
        document.getElementById('currentWeather').classList.add('hidden');
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
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=15&timezone=auto`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Error en la API');

            const data = await res.json();

            // 1. Tiempo actual
            this.displayCurrentWeather(data.current);

            // 2. Renderizar Gráficas
            if (typeof Chart === 'function') {
                this.renderHourlyChart(data.hourly);
                this.renderDailyChart(data.daily);
            }

            // 3. Mostrar UI
            document.getElementById('currentWeather').classList.remove('hidden');
            const chartsContainer = document.getElementById('charts');
            if (chartsContainer) chartsContainer.classList.remove('hidden');

            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('es-ES');

        } catch (error) {
            console.error(error);
            this.showError('Error al cargar datos');
        } finally {
            this.hideLoading();
        }
    }

    displayCurrentWeather(c) {
        document.getElementById('currentTemp').textContent = `${Math.round(c.temperature_2m)}°C`;
        const info = this.getWeatherInfo(c.weather_code);
        document.getElementById('weatherIcon').textContent = info.icon;
        document.getElementById('weatherDescription').textContent = info.description;
        document.getElementById('feelsLike').textContent = `${Math.round(c.apparent_temperature)}°C`;
        document.getElementById('humidity').textContent = `${c.relative_humidity_2m}%`;
        document.getElementById('windSpeed').textContent = `${c.wind_speed_10m} km/h`;
        document.getElementById('visibility').textContent = `${(c.visibility / 1000).toFixed(1)} km`;
        document.getElementById('pressure').textContent = `${c.surface_pressure} hPa`;
        document.getElementById('precipitation').textContent = `${c.precipitation} mm`;
    }

    renderHourlyChart(hourly) {
        const labels = hourly.time.slice(0, 48).map(t => `${new Date(t).getHours()}h`);
        const temps = hourly.temperature_2m.slice(0, 48);

        if (this.hourlyChart) this.hourlyChart.destroy();

        this.hourlyChart = new Chart(document.getElementById('hourlyChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: temps,
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false } }
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
}

document.addEventListener('DOMContentLoaded', () => { new WeatherApp(); });

/* REGISTRO DEL SERVICE WORKER (DESACTIVADO PARA DESARROLLO)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
*/