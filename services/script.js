class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.hourlyChart = null;  // ← AÑADIDO
        this.dailyChart = null;   // ← AÑADIDO
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
        document.getElementById('forecast').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('error').querySelector('p').textContent = `❌ ${message}`;
        document.getElementById('error').classList.remove('hidden');
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
            const name = await this.getLocationName(latitude, longitude);
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

    async getLocationName(lat, lon) {
        try {
            const res = await fetch(
                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=es`
            );
            const data = await res.json();
            const r = data.results?.[0];
            return r ? `${r.name}, ${r.country}` : 'Ubicación actual';
        } catch {
            return 'Ubicación actual';
        }
    }

    async fetchWeatherData(lat, lon) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=15&timezone=auto`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Error en la respuesta de la API');

            const data = await res.json();
            if (!data.current || !data.daily || !data.hourly) {
                throw new Error('Datos incompletos de Open-Meteo');
            }

            // 1️⃣ Tiempo actual
            this.displayCurrentWeather(data.current);

            // 2️⃣ GRÁFICAS (AMBAS)
            if (typeof Chart === 'function') {
                this.renderHourlyChart(data.hourly);
                this.renderDailyChart(data.daily);  // ← AÑADIDO
            } else {
                console.warn('Chart.js no disponible, se omite la gráfica');
            }

            // 3️⃣ Pronóstico (cards)
            this.displayForecast(data.daily);

            // 4️⃣ Mostrar secciones
            document.getElementById('currentWeather').classList.remove('hidden');
            document.getElementById('forecast').classList.remove('hidden');
            document.getElementById('charts').classList.remove('hidden');

            // 5️⃣ Última actualización
            document.getElementById('lastUpdate').textContent =
                new Date().toLocaleTimeString('es-ES');

        } catch (error) {
            console.error(error);
            this.showError('No se pudieron cargar los datos meteorológicos');
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

    displayForecast(daily) {
        const container = document.getElementById('forecastContainer');
        container.innerHTML = '';

        daily.time.forEach((dateStr, i) => {
            const date = new Date(dateStr);
            const info = this.getWeatherInfo(daily.weather_code[i]);

            const item = document.createElement('div');
            item.className = 'forecast-item';
            item.innerHTML = `
                <div class="forecast-header">
                    <div>
                        <div class="forecast-date">${i === 0 ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'long' })}</div>
                        <div style="font-size:.9rem">${date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div class="forecast-icon">${info.icon}</div>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="forecast-low">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // ✅ GRÁFICA HORARIA (48h) - ya la tienes perfecta
    renderHourlyChart(hourly) {
        const labels = hourly.time.slice(0, 48).map(t => {
            const date = new Date(t);
            return `${date.getHours()}h`;
        });

        const temperatures = hourly.temperature_2m.slice(0, 48);
        const feelsLike = hourly.apparent_temperature?.slice(0, 48) || temperatures;
        const precipitation = hourly.precipitation.slice(0, 48);

        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }

        this.hourlyChart = new Chart(
            document.getElementById('hourlyChart'),
            {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Temperatura (°C)',
                            data: temperatures,
                            borderColor: '#4A90E2',
                            backgroundColor: 'rgba(74, 144, 226, 0.1)',
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Sensación (°C)',
                            data: feelsLike,
                            borderColor: '#7B68EE',
                            backgroundColor: 'rgba(123, 104, 238, 0.1)',
                            tension: 0.4,
                            fill: false,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Precipitación (mm)',
                            data: precipitation,
                            borderColor: '#FF6B6B',
                            backgroundColor: 'rgba(255, 107, 107, 0.2)',
                            tension: 0.3,
                            yAxisID: 'y1',
                            borderDash: [5, 5]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        legend: { position: 'top', labels: { padding: 20, usePointStyle: true } },
                        tooltip: {
                            callbacks: {
                                afterLabel: function(context) {
                                    if (context.datasetIndex === 2) {
                                        return `Probabilidad baja si < 0.5mm`;
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Temperatura (°C)' },
                            grid: { drawOnChartArea: false }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Precipitación (mm)' },
                            grid: { drawOnChartArea: false }
                        },
                        x: { grid: { display: false } }
                    }
                }
            }
        );
    }

renderDailyChart(daily) {
    const labels = daily.time.map(dateStr => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric' 
        });
    });

    // Mapea códigos de clima a iconos emoji
    const weatherIcons = daily.weather_code.map(code => this.getWeatherIcon(code));

    if (this.dailyChart) {
        this.dailyChart.destroy();
    }

    this.dailyChart = new Chart(
        document.getElementById('dailyChart'),
        {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Tª Máxima (°C)',
                        data: daily.temperature_2m_max,
                        backgroundColor: 'rgba(74, 144, 226, 0.8)',
                        borderColor: '#4A90E2',
                        borderRadius: 8,
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Tª Mínima (°C)',
                        data: daily.temperature_2m_min,
                        backgroundColor: 'rgba(123, 104, 238, 0.6)',
                        borderColor: '#7B68EE',
                        borderRadius: 8,
                        borderWidth: 1,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { padding: 20 } },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `${context[0].label} ${weatherIcons[context[0].dataIndex]}`;
                            },
                            afterLabel: function(context) {
                                const max = context.datasetIndex === 0 ? context.parsed.y : null;
                                const min = context.datasetIndex === 1 ? context.parsed.y : null;
                                return max && min ? 
                                    `Rango: ${min.toFixed(1)}° → ${max.toFixed(1)}°` : '';
                            }
                        }
                    },
                    // ✅ ICONOS EN TOOLTIPS
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: 'white',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value, context) => {
                            return weatherIcons[context.dataIndex];
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Temperatura (°C)' }
                    },
                    x: { grid: { display: false }, ticks: { maxRotation: 45 } }
                }
            },
            plugins: [ChartDataLabels]  // ← Plugin para iconos encima barras
        }
    );
}


    getWeatherInfo(code) {
        const map = {
            0: ['☀️', 'Despejado'],
            1: ['🌤️', 'Mayormente despejado'],
            2: ['⛅', 'Parcialmente nublado'],
            3: ['☁️', 'Nublado'],
            45: ['🌫️', 'Niebla'],
            61: ['🌧️', 'Lluvia'],
            71: ['🌨️', 'Nieve'],
            95: ['⛈️', 'Tormenta']
        };
        const r = map[code] || ['🌤️', 'Clima desconocido'];
        return { icon: r[0], description: r[1] };
    }
    Chart.register(ChartDataLabels);
    getWeatherIcon(code) {
    const map = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        71: '🌨️', 73: '🌨️', 75: '🌨️',
        80: '🌦️', 81: '🌦️', 82: '🌦️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return map[code] || '🌤️';
}

}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

/* REGISTRO DEL SERVICE WORKER */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(reg => console.log('Service Worker activo:', reg.scope))
            .catch(err => console.error('SW error:', err));
    });
}
