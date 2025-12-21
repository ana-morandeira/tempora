class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        this.updateCurrentDate();
        this.getCurrentLocation();
    }

    bindEvents() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            const city = document.getElementById('cityInput').value.trim();
            if (city) {
                this.searchByCity(city);
            }
        });

        // Enter key for search
        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = e.target.value.trim();
                if (city) {
                    this.searchByCity(city);
                }
            }
        });

        // Geolocation button
        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('es-ES', options);
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

    showError(message = 'Error al cargar los datos del clima') {
        document.getElementById('error').querySelector('p').textContent = `❌ ${message}`;
        document.getElementById('error').classList.remove('hidden');
        this.hideLoading();
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocalización no soportada en este navegador');
            return;
        }

        this.showLoading();

        try {
            const position = await this.getGeolocation();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherData(latitude, longitude);
            
            // Get location name
            const locationName = await this.getLocationName(latitude, longitude);
            document.getElementById('locationName').textContent = `📍 ${locationName}`;
        } catch (error) {
            console.error('Error getting location:', error);
            this.showError('Error al obtener la ubicación actual');
        }
    }

    getGeolocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }

    async searchByCity(cityName) {
        this.showLoading();

        try {
            // Use geocoding to get coordinates from city name
            const coords = await this.geocodeCity(cityName);
            if (coords) {
                await this.fetchWeatherData(coords.lat, coords.lon);
                document.getElementById('locationName').textContent = `📍 ${coords.name}`;
                document.getElementById('cityInput').value = '';
            } else {
                this.showError('Ciudad no encontrada');
            }
        } catch (error) {
            console.error('Error searching city:', error);
            this.showError('Error al buscar la ciudad');
        }
    }

    async geocodeCity(cityName) {
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    lat: result.latitude,
                    lon: result.longitude,
                    name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }

    async getLocationName(lat, lon) {
        try {
            // Reverse geocoding using Open-Meteo's geocoding API
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=es&format=json`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`;
            }
            return 'Ubicación actual';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return 'Ubicación actual';
        }
    }

    async fetchWeatherData(latitude, longitude) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_max&timezone=auto&forecast_days=15`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayCurrentWeather(data.current, data.current_units);
            this.displayForecast(data.daily, data.daily_units);
            
            // Update last update time
            document.getElementById('lastUpdate').textContent = 
                new Date().toLocaleTimeString('es-ES');
            
            this.hideLoading();
            document.getElementById('currentWeather').classList.remove('hidden');
            document.getElementById('forecast').classList.remove('hidden');
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            this.showError('Error al cargar los datos del clima');
        }
    }

    displayCurrentWeather(current, units) {
        // Temperature
        document.getElementById('currentTemp').textContent = 
            `${Math.round(current.temperature_2m)}°C`;
        
        // Weather icon and description
        const { icon, description } = this.getWeatherInfo(current.weather_code);
        document.getElementById('weatherIcon').textContent = icon;
        document.getElementById('weatherDescription').textContent = description;
        
        // Details
        document.getElementById('feelsLike').textContent = 
            `${Math.round(current.apparent_temperature)}°C`;
        document.getElementById('humidity').textContent = 
            `${current.relative_humidity_2m}%`;
        document.getElementById('windSpeed').textContent = 
            `${current.wind_speed_10m} km/h`;
        document.getElementById('visibility').textContent = 
            `${(current.visibility / 1000).toFixed(1)} km`;
        document.getElementById('pressure').textContent = 
            `${current.surface_pressure} hPa`;
        document.getElementById('precipitation').textContent = 
            `${current.precipitation} mm`;
    }

    displayForecast(daily, units) {
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';

        for (let i = 0; i < daily.time.length; i++) {
            const date = new Date(daily.time[i]);
            const { icon, description } = this.getWeatherInfo(daily.weather_code[i]);
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const isToday = i === 0;
            const dayName = isToday ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'long' });
            const dayDate = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
            
            forecastItem.innerHTML = `
                <div class="forecast-header">
                    <div>
                        <div class="forecast-date">${dayName}</div>
                        <div style="font-size: 0.9rem; color: var(--text-light);">${dayDate}</div>
                    </div>
                    <div class="forecast-icon">${icon}</div>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="forecast-low">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
                <div class="forecast-details">
                    <div class="forecast-detail">
                        <div class="forecast-detail-label">Precipitación</div>
                        <div class="forecast-detail-value">${daily.precipitation_sum[i]} mm</div>
                    </div>
                    <div class="forecast-detail">
                        <div class="forecast-detail-label">Viento</div>
                        <div class="forecast-detail-value">${daily.wind_speed_10m_max[i]} km/h</div>
                    </div>
                    <div class="forecast-detail">
                        <div class="forecast-detail-label">Humedad</div>
                        <div class="forecast-detail-value">${daily.relative_humidity_2m_max[i]}%</div>
                    </div>
                </div>
            `;
            
            forecastContainer.appendChild(forecastItem);
        }
    }

    getWeatherInfo(weatherCode) {
        const weatherCodes = {
            0: { icon: '☀️', description: 'Cielo despejado' },
            1: { icon: '🌤️', description: 'Principalmente despejado' },
            2: { icon: '⛅', description: 'Parcialmente nublado' },
            3: { icon: '☁️', description: 'Nublado' },
            45: { icon: '🌫️', description: 'Niebla' },
            48: { icon: '🌫️', description: 'Niebla con escarcha' },
            51: { icon: '🌦️', description: 'Llovizna ligera' },
            53: { icon: '🌦️', description: 'Llovizna moderada' },
            55: { icon: '🌦️', description: 'Llovizna intensa' },
            56: { icon: '🌦️', description: 'Llovizna helada ligera' },
            57: { icon: '🌦️', description: 'Llovizna helada intensa' },
            61: { icon: '🌧️', description: 'Lluvia ligera' },
            63: { icon: '🌧️', description: 'Lluvia moderada' },
            65: { icon: '🌧️', description: 'Lluvia intensa' },
            66: { icon: '🌧️', description: 'Lluvia helada ligera' },
            67: { icon: '🌧️', description: 'Lluvia helada intensa' },
            71: { icon: '🌨️', description: 'Nevada ligera' },
            73: { icon: '🌨️', description: 'Nevada moderada' },
            75: { icon: '🌨️', description: 'Nevada intensa' },
            77: { icon: '🌨️', description: 'Granizo' },
            80: { icon: '🌦️', description: 'Chubascos ligeros' },
            81: { icon: '🌦️', description: 'Chubascos moderados' },
            82: { icon: '🌦️', description: 'Chubascos intensos' },
            85: { icon: '🌨️', description: 'Chubascos de nieve ligeros' },
            86: { icon: '🌨️', description: 'Chubascos de nieve intensos' },
            95: { icon: '⛈️', description: 'Tormenta' },
            96: { icon: '⛈️', description: 'Tormenta con granizo ligero' },
            99: { icon: '⛈️', description: 'Tormenta con granizo intenso' }
        };

        return weatherCodes[weatherCode] || { icon: '🌤️', description: 'Clima desconocido' };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

const CACHE_NAME = 'weather-app-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});