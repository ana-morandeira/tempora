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
            this.showLoading();
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,is_day,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=15&timezone=auto`;

            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data = await res.json();

            document.getElementById('currentWeather').classList.remove('hidden');
            document.getElementById('charts').classList.remove('hidden');

            this.displayCurrentWeather(data.current);
            this.updateBackgroundImage(data.current.weather_code, data.current.is_day);

            if (typeof Chart !== 'undefined') {
                this.renderHourlyChart(data.hourly);
                this.renderDailyChart(data.daily);
            }

            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            this.showError('Error al obtener datos climáticos');
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
        const weatherIconsMap = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌧️', 61: '🌧️', 71: '❄️', 95: '⛈️' };
        const labels = hourly.time.slice(0, 24).map(t => `${new Date(t).getHours()}h`);
        const temps = hourly.temperature_2m.slice(0, 24);
        const codes = hourly.weather_code.slice(0, 24);

        if (this.hourlyChart) this.hourlyChart.destroy();

        this.hourlyChart = new Chart(document.getElementById('hourlyChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: temps,
                    borderColor: '#001a33',
                    backgroundColor: 'rgba(0, 26, 51, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            plugins: [ChartDataLabels],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: (ctx) => ctx.dataIndex % 3 === 0,
                        formatter: (val, ctx) => weatherIconsMap[codes[ctx.dataIndex]] || '🌡️',
                        align: 'top',
                        color: '#001a33',
                        font: { size: 14 }
                    }
                },
                scales: { 
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(0,0,0,0.05)' } }
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
                    { label: 'Máx', data: daily.temperature_2m_max, backgroundColor: '#4A90E2', borderRadius: 5 },
                    { label: 'Mín', data: daily.temperature_2m_min, backgroundColor: '#7B68EE', borderRadius: 5 }
                ]
            },
            plugins: [ChartDataLabels],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (val, ctx) => ctx.datasetIndex === 0 ? this.getWeatherIcon(daily.weather_code[ctx.dataIndex]) : '',
                        color: '#001a33'
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

    // 1. Lógica de selección de archivo (Asegúrate de que las extensiones sean correctas)
    if (isDay === 1) {
        if (code === 0) fileName = 'sunDay.webm';
        else if (code <= 3) fileName = 'cloudyDay.webp'; // <--- TU WEBP
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


    // 2. ¿Es Vídeo o Imagen?
    if (fileName.endsWith('.webm')) {
        // MOSTRAR VÍDEO, OCULTAR FONDO DEL BODY
        videoElement.style.display = 'block';
        videoElement.src = fullPath;
        videoElement.load();
        body.style.backgroundImage = 'none';
    } else {
        // MOSTRAR IMAGEN EN EL BODY, OCULTAR VÍDEO
        videoElement.style.display = 'none';
        body.style.backgroundImage = `url('${fullPath}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
    }
}
}

document.addEventListener('DOMContentLoaded', () => { new WeatherApp(); });