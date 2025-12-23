/**
 * MÓDULO: Configuración y Constantes
 */
const WeatherConfig = {
    // La API key debe manejarse de forma segura (en un entorno real, usar backend)
    // Para desarrollo, puedes obtener una en: https://openweathermap.org/api
    API_KEY: import.meta.env?.VITE_OPENWEATHER_API_KEY || 'TU_API_KEY_AQUI', // Cambiar en producción
    API_BASE: 'https://api.openweathermap.org/data/2.5',
    GEO_API_BASE: 'https://api.openweathermap.org/geo/1.0',
    
    // Límites y configuraciones
    MAX_FAVORITES: 10,
    MAX_HISTORY: 20,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutos en milisegundos
    
    // URLs de íconos
    ICON_BASE: 'https://openweathermap.org/img/wn',
    
    // Mapeo de condiciones climáticas a clases CSS
    WEATHER_TYPES: {
        'clear': 'sunny',
        'clouds': 'cloudy',
        'rain': 'rainy',
        'drizzle': 'rainy',
        'thunderstorm': 'stormy',
        'snow': 'snowy',
        'mist': 'cloudy',
        'smoke': 'cloudy',
        'haze': 'cloudy',
        'dust': 'cloudy',
        'fog': 'cloudy',
        'sand': 'cloudy',
        'ash': 'cloudy',
        'squall': 'stormy',
        'tornado': 'stormy'
    },
    
    // Configuración de unidades
    UNITS: {
        metric: {
            temp: '°C',
            speed: 'km/h',
            pressure: 'hPa',
            visibility: 'km'
        },
        imperial: {
            temp: '°F',
            speed: 'mph',
            pressure: 'hPa',
            visibility: 'mi'
        }
    },
    
    // Mensajes predefinidos
    MESSAGES: {
        LOADING: '⏳ Cargando datos del clima...',
        ERROR: '❌ Error al cargar datos',
        NO_CITY: 'Por favor, ingresa una ciudad',
        LOCATION_DENIED: 'Permiso de ubicación denegado',
        LOCATION_UNAVAILABLE: 'Ubicación no disponible',
        LOCATION_TIMEOUT: 'Tiempo de espera agotado',
        API_ERROR: 'Error en el servicio de clima'
    }
};

/**
 * MÓDULO: Estado de la aplicación
 */
const AppState = {
    currentUnit: 'metric', // metric = Celsius, imperial = Fahrenheit
    currentWeather: null,
    currentForecast: null,
    favorites: [],
    searchHistory: [],
    isLoading: false,
    lastUpdate: null,
    
    init() {
        this.loadFromStorage();
        this.setupAutoRefresh();
    },
    
    loadFromStorage() {
        try {
            this.favorites = JSON.parse(localStorage.getItem('weatherFavorites_v2')) || [];
            this.searchHistory = JSON.parse(localStorage.getItem('weatherHistory_v2')) || [];
        } catch (error) {
            console.error('Error al cargar datos de almacenamiento:', error);
            this.favorites = [];
            this.searchHistory = [];
        }
    },
    
    saveToStorage() {
        try {
            localStorage.setItem('weatherFavorites_v2', JSON.stringify(this.favorites));
            localStorage.setItem('weatherHistory_v2', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error al guardar datos:', error);
        }
    },
    
    addToHistory(city, country, lat, lon) {
        const entry = {
            city,
            country,
            lat,
            lon,
            timestamp: new Date().toISOString(),
            id: `${city}_${lat}_${lon}_${Date.now()}`
        };
        
        // Evitar duplicados recientes
        const recentDuplicate = this.searchHistory.some(item => 
            item.city === city && 
            Date.now() - new Date(item.timestamp).getTime() < 5 * 60 * 1000 // 5 minutos
        );
        
        if (!recentDuplicate) {
            this.searchHistory.unshift(entry);
            
            // Mantener límite de historial
            if (this.searchHistory.length > WeatherConfig.MAX_HISTORY) {
                this.searchHistory = this.searchHistory.slice(0, WeatherConfig.MAX_HISTORY);
            }
            
            this.saveToStorage();
        }
    },
    
    setupAutoRefresh() {
        // Refrescar automáticamente cada 5 minutos
        setInterval(() => {
            if (this.currentWeather && !this.isLoading) {
                this.refreshCurrentWeather();
            }
        }, 5 * 60 * 1000);
    },
    
    async refreshCurrentWeather() {
        if (!this.currentWeather) return;
        
        try {
            this.isLoading = true;
            UI.showToast('🔄 Actualizando datos del clima...', 'info');
            
            const weather = await WeatherAPI.getWeatherByCoords(
                this.currentWeather.coord.lat,
                this.currentWeather.coord.lon
            );
            
            this.currentWeather = weather;
            UI.updateCurrentWeather(weather);
            UI.showToast('✅ Datos actualizados', 'success');
            
        } catch (error) {
            console.error('Error al refrescar clima:', error);
        } finally {
            this.isLoading = false;
        }
    },
    
    clearCache() {
        this.currentWeather = null;
        this.currentForecast = null;
        this.lastUpdate = null;
    }
};

/**
 * MÓDULO: Elementos del DOM
 */
const DOM = {
    // Búsqueda
    searchForm: document.getElementById('searchForm'),
    citySearch: document.getElementById('citySearch'),
    searchBtn: document.getElementById('searchBtn'),
    suggestions: document.getElementById('suggestions'),
    
    // Acciones
    locationBtn: document.getElementById('locationBtn'),
    unitToggle: document.getElementById('unitToggle'),
    
    // Clima actual
    currentWeather: document.getElementById('currentWeather'),
    weatherLoading: document.getElementById('weatherLoading'),
    weatherError: document.getElementById('weatherError'),
    retryBtn: document.getElementById('retryBtn'),
    weatherStats: document.getElementById('weatherStats'),
    
    // Pronóstico
    forecastGrid: document.getElementById('forecastGrid'),
    toggleForecast: document.getElementById('toggleForecast'),
    
    // Favoritos
    favoritesList: document.getElementById('favoritesList'),
    emptyFavorites: document.getElementById('emptyFavorites'),
    manageFavorites: document.getElementById('manageFavorites'),
    importFavorites: document.getElementById('importFavorites'),
    exportFavorites: document.getElementById('exportFavorites'),
    clearFavorites: document.getElementById('clearFavorites'),
    
    // Historial
    historyList: document.getElementById('historyList'),
    
    // Modales
    errorModal: document.getElementById('errorModal'),
    permissionModal: document.getElementById('permissionModal'),
    modalDescription: document.getElementById('modalDescription'),
    modalRetryBtn: document.getElementById('modalRetryBtn'),
    grantPermissionBtn: document.getElementById('grantPermissionBtn'),
    closeModalBtn: document.getElementById('closeModal'),
    
    // UI
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

/**
 * MÓDULO: Utilidades de seguridad y validación
 */
const SecurityUtils = {
    /**
     * Sanitiza texto para prevenir XSS
     */
    sanitize(text) {
        if (typeof text !== 'string') return text;
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Valida nombre de ciudad
     */
    validateCityName(city) {
        if (!city || typeof city !== 'string') {
            return { isValid: false, error: 'Nombre de ciudad inválido' };
        }
        
        const trimmed = city.trim();
        
        if (trimmed.length === 0) {
            return { isValid: false, error: 'El nombre de la ciudad no puede estar vacío' };
        }
        
        if (trimmed.length > 100) {
            return { isValid: false, error: 'Nombre de ciudad demasiado largo' };
        }
        
        // Validación básica de caracteres (opcional, según necesidades)
        const invalidChars = /[<>{}[\]\\]/;
        if (invalidChars.test(trimmed)) {
            return { isValid: false, error: 'Nombre de ciudad contiene caracteres inválidos' };
        }
        
        return { isValid: true, value: trimmed };
    },
    
    /**
     * Limita el número de favoritos
     */
    limitFavorites(favorites) {
        return favorites.slice(0, WeatherConfig.MAX_FAVORITES);
    },
    
    /**
     * Manejo seguro de localStorage
     */
    safeLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error al leer ${key} de localStorage:`, error);
            return defaultValue;
        }
    }
};

/**
 * MÓDULO: API de Weather
 */
const WeatherAPI = {
    /**
     * Obtiene clima por nombre de ciudad
     */
    async getWeatherByCity(city) {
        try {
            const validation = SecurityUtils.validateCityName(city);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            
            const response = await fetch(
                `${WeatherConfig.API_BASE}/weather?q=${encodeURIComponent(validation.value)}&units=${AppState.currentUnit}&appid=${WeatherConfig.API_KEY}&lang=es`
            );
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Ciudad no encontrada');
                } else if (response.status === 401) {
                    throw new Error('Error de autenticación. Verifica tu API key.');
                } else if (response.status === 429) {
                    throw new Error('Límite de solicitudes excedido. Intenta más tarde.');
                } else {
                    throw new Error(`Error del servidor: ${response.status}`);
                }
            }
            
            const data = await response.json();
            return this.processWeatherData(data);
            
        } catch (error) {
            console.error('Error en getWeatherByCity:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene clima por coordenadas
     */
    async getWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `${WeatherConfig.API_BASE}/weather?lat=${lat}&lon=${lon}&units=${AppState.currentUnit}&appid=${WeatherConfig.API_KEY}&lang=es`
            );
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processWeatherData(data);
            
        } catch (error) {
            console.error('Error en getWeatherByCoords:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene pronóstico de 5 días
     */
    async getForecast(lat, lon) {
        try {
            const response = await fetch(
                `${WeatherConfig.API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${AppState.currentUnit}&appid=${WeatherConfig.API_KEY}&lang=es`
            );
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processForecastData(data);
            
        } catch (error) {
            console.error('Error en getForecast:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene sugerencias de ciudades
     */
    async getCitySuggestions(query) {
        try {
            if (!query || query.length < 2) return [];
            
            const response = await fetch(
                `${WeatherConfig.GEO_API_BASE}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${WeatherConfig.API_KEY}`
            );
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.map(city => ({
                name: city.name,
                country: city.country,
                state: city.state,
                lat: city.lat,
                lon: city.lon,
                displayName: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`
            }));
            
        } catch (error) {
            console.error('Error en getCitySuggestions:', error);
            return [];
        }
    },
    
    /**
     * Procesa datos del clima
     */
    processWeatherData(data) {
        return {
            id: data.id,
            name: data.name,
            country: data.sys.country,
            coord: data.coord,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            temp_min: Math.round(data.main.temp_min),
            temp_max: Math.round(data.main.temp_max),
            wind_speed: Math.round(data.wind.speed),
            wind_deg: data.wind.deg,
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000),
            weather: {
                main: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                id: data.weather[0].id
            },
            clouds: data.clouds?.all || 0,
            visibility: data.visibility,
            dt: new Date(data.dt * 1000),
            timezone: data.timezone
        };
    },
    
    /**
     * Procesa datos del pronóstico
     */
    processForecastData(data) {
        const dailyForecasts = data.list.filter(item => 
            item.dt_txt.includes('12:00:00')
        ).slice(0, 5);
        
        return dailyForecasts.map(day => ({
            dt: new Date(day.dt * 1000),
            temp: Math.round(day.main.temp),
            temp_min: Math.round(day.main.temp_min),
            temp_max: Math.round(day.main.temp_max),
            humidity: day.main.humidity,
            pressure: day.main.pressure,
            weather: {
                main: day.weather[0].main,
                description: day.weather[0].description,
                icon: day.weather[0].icon
            },
            wind_speed: Math.round(day.wind.speed)
        }));
    }
};

/**
 * MÓDULO: Interfaz de usuario
 */
const UI = {
    /**
     * Muestra/oculta loading
     */
    setLoading(isLoading) {
        DOM.weatherLoading.hidden = !isLoading;
        DOM.currentWeather.hidden = isLoading;
        DOM.weatherStats.hidden = isLoading;
        
        if (isLoading) {
            DOM.searchBtn.disabled = true;
            DOM.locationBtn.disabled = true;
            AppState.isLoading = true;
        } else {
            DOM.searchBtn.disabled = false;
            DOM.locationBtn.disabled = false;
            AppState.isLoading = false;
        }
    },
    
    /**
     * Muestra error
     */
    showError(message, retryCallback = null) {
        DOM.weatherError.hidden = false;
        DOM.currentWeather.hidden = true;
        DOM.weatherError.querySelector('.error-message').textContent = message;
        
        if (retryCallback) {
            DOM.retryBtn.onclick = retryCallback;
            DOM.retryBtn.hidden = false;
        } else {
            DOM.retryBtn.hidden = true;
        }
        
        UI.showToast(message, 'error');
    },
    
    /**
     * Actualiza clima actual
     */
    updateCurrentWeather(weatherData) {
        AppState.currentWeather = weatherData;
        AppState.lastUpdate = new Date();
        
        // Determinar tipo de clima para clase CSS
        const weatherType = WeatherConfig.WEATHER_TYPES[weatherData.weather.main.toLowerCase()] || 'cloudy';
        const isNight = this.isNightTime(weatherData);
        
        // Actualizar clase del contenedor
        DOM.currentWeather.className = `current-weather ${weatherType} ${isNight ? 'night' : ''}`;
        
        // Crear contenido de forma segura
        this.createCurrentWeatherContent(weatherData);
        
        // Mostrar sección de estadísticas
        DOM.weatherStats.hidden = false;
        this.updateWeatherStats(weatherData);
        
        // Actualizar historial
        AppState.addToHistory(
            weatherData.name,
            weatherData.country,
            weatherData.coord.lat,
            weatherData.coord.lon
        );
        
        // Anunciar a lectores de pantalla
        this.announceWeatherUpdate(weatherData);
    },
    
    /**
     * Crea contenido del clima actual de forma segura
     */
    createCurrentWeatherContent(weatherData) {
        const unitConfig = WeatherConfig.UNITS[AppState.currentUnit];
        const isFavorite = AppState.favorites.some(fav => fav.id === weatherData.id);
        
        // Limpiar contenido actual
        DOM.currentWeather.innerHTML = '';
        
        // Crear estructura
        const container = document.createElement('div');
        container.className = 'weather-main';
        
        // Información principal
        const infoDiv = document.createElement('div');
        infoDiv.className = 'weather-info';
        
        // Header con ubicación y acciones
        const headerDiv = document.createElement('div');
        headerDiv.className = 'weather-header';
        
        const locationDiv = document.createElement('div');
        locationDiv.className = 'weather-location';
        
        const cityName = document.createElement('h2');
        cityName.textContent = `${weatherData.name}, ${weatherData.country}`;
        
        const locationDetails = document.createElement('div');
        locationDetails.className = 'location-details';
        locationDetails.innerHTML = `
            <span>📍 ${this.formatCoords(weatherData.coord.lat, weatherData.coord.lon)}</span>
            <span>•</span>
            <span>🕐 ${weatherData.dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
        `;
        
        locationDiv.appendChild(cityName);
        locationDiv.appendChild(locationDetails);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'weather-actions';
        
        const favButton = document.createElement('button');
        favButton.className = `fav-btn ${isFavorite ? 'active' : ''}`;
        favButton.innerHTML = `
            <span class="icon" aria-hidden="true">${isFavorite ? '⭐' : '☆'}</span>
            <span class="btn-text">${isFavorite ? 'En favoritos' : 'Agregar a favoritos'}</span>
        `;
        favButton.addEventListener('click', () => this.toggleFavorite(weatherData));
        
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn btn-secondary btn-icon';
        refreshButton.innerHTML = `
            <span class="icon" aria-hidden="true">🔄</span>
            <span class="visually-hidden">Actualizar</span>
        `;
        refreshButton.addEventListener('click', () => AppState.refreshCurrentWeather());
        
        actionsDiv.appendChild(favButton);
        actionsDiv.appendChild(refreshButton);
        
        headerDiv.appendChild(locationDiv);
        headerDiv.appendChild(actionsDiv);
        
        // Temperatura
        const tempDiv = document.createElement('div');
        tempDiv.className = 'weather-temp';
        tempDiv.innerHTML = `
            ${weatherData.temp}
            <span class="temp-unit">${unitConfig.temp}</span>
        `;
        
        // Descripción
        const descDiv = document.createElement('div');
        descDiv.className = 'weather-description';
        descDiv.innerHTML = `
            <span class="icon" aria-hidden="true">${this.getWeatherIcon(weatherData.weather.main)}</span>
            <span>${this.capitalizeFirst(weatherData.weather.description)}</span>
        `;
        
        // Detalles
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'weather-details';
        
        const details = [
            { label: 'Sensación térmica', value: `${weatherData.feels_like}${unitConfig.temp}` },
            { label: 'Humedad', value: `${weatherData.humidity}%` },
            { label: 'Viento', value: `${weatherData.wind_speed} ${unitConfig.speed}` },
            { label: 'Presión', value: `${weatherData.pressure} ${unitConfig.pressure}` }
        ];
        
        details.forEach(detail => {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'detail-item';
            detailDiv.innerHTML = `
                <strong>${detail.label}</strong>
                <span class="detail-value">${detail.value}</span>
            `;
            detailsDiv.appendChild(detailDiv);
        });
        
        // Construir infoDiv
        infoDiv.appendChild(headerDiv);
        infoDiv.appendChild(tempDiv);
        infoDiv.appendChild(descDiv);
        infoDiv.appendChild(detailsDiv);
        
        // Ícono del clima
        const iconDiv = document.createElement('div');
        iconDiv.className = 'weather-icon';
        iconDiv.innerHTML = `
            <img src="${WeatherConfig.ICON_BASE}/${weatherData.weather.icon}@4x.png" 
                 alt="${weatherData.weather.description}"
                 loading="lazy">
            <p class="icon-label" aria-hidden="true">${this.getWeatherEmoji(weatherData.weather.main)}</p>
        `;
        
        // Ensamblar contenedor
        container.appendChild(infoDiv);
        container.appendChild(iconDiv);
        
        DOM.currentWeather.appendChild(container);
    },
    
    /**
     * Actualiza estadísticas del clima
     */
    updateWeatherStats(weatherData) {
        const unitConfig = WeatherConfig.UNITS[AppState.currentUnit];
        
        const stats = [
            { 
                icon: '🌅', 
                label: 'Amanecer', 
                value: weatherData.sunrise.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
            },
            { 
                icon: '🌇', 
                label: 'Atardecer', 
                value: weatherData.sunset.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
            },
            { 
                icon: '👁️', 
                label: 'Visibilidad', 
                value: `${(weatherData.visibility / 1000).toFixed(1)} ${unitConfig.visibility}`
            },
            { 
                icon: '☁️', 
                label: 'Nubosidad', 
                value: `${weatherData.clouds}%`
            }
        ];
        
        DOM.weatherStats.innerHTML = '';
        
        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <h4>
                    <span class="icon" aria-hidden="true">${stat.icon}</span>
                    ${stat.label}
                </h4>
                <div class="stat-value">${stat.value}</div>
            `;
            DOM.weatherStats.appendChild(statCard);
        });
    },
    
    /**
     * Actualiza pronóstico
     */
    updateForecast(forecastData) {
        AppState.currentForecast = forecastData;
        const unitSymbol = WeatherConfig.UNITS[AppState.currentUnit].temp;
        
        DOM.forecastGrid.innerHTML = '';
        
        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.setAttribute('role', 'listitem');
            
            const dayName = day.dt.toLocaleDateString('es', { weekday: 'short' });
            const date = day.dt.toLocaleDateString('es', { day: 'numeric', month: 'short' });
            
            card.innerHTML = `
                <div class="day">${dayName}</div>
                <div class="date" aria-hidden="true">${date}</div>
                <img src="${WeatherConfig.ICON_BASE}/${day.weather.icon}@2x.png" 
                     alt="${day.weather.description}"
                     loading="lazy">
                <div class="temp">
                    ${day.temp}${unitSymbol}
                    <span class="temp-min" aria-label="Mínima">${day.temp_min}${unitSymbol}</span>
                </div>
                <div class="description">${this.capitalizeFirst(day.weather.description)}</div>
            `;
            
            card.addEventListener('click', () => {
                this.showForecastDetails(day);
            });
            
            DOM.forecastGrid.appendChild(card);
        });
    },
    
    /**
     * Muestra detalles del pronóstico
     */
    showForecastDetails(day) {
        const unitSymbol = WeatherConfig.UNITS[AppState.currentUnit].temp;
        const details = `
            <strong>Fecha:</strong> ${day.dt.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <br>
            <strong>Temperatura máxima:</strong> ${day.temp_max}${unitSymbol}
            <br>
            <strong>Temperatura mínima:</strong> ${day.temp_min}${unitSymbol}
            <br>
            <strong>Humedad:</strong> ${day.humidity}%
            <br>
            <strong>Presión:</strong> ${day.pressure} hPa
            <br>
            <strong>Viento:</strong> ${day.wind_speed} ${WeatherConfig.UNITS[AppState.currentUnit].speed}
        `;
        
        UI.showToast(`Pronóstico detallado: ${day.dt.toLocaleDateString('es', { weekday: 'long' })}`, 'info');
    },
    
    /**
     * Actualiza lista de favoritos
     */
    updateFavorites() {
        if (AppState.favorites.length === 0) {
            DOM.emptyFavorites.hidden = false;
            DOM.favoritesList.innerHTML = '';
            return;
        }
        
        DOM.emptyFavorites.hidden = true;
        DOM.favoritesList.innerHTML = '';
        
        AppState.favorites.forEach((fav, index) => {
            const item = document.createElement('div');
            item.className = 'favorite-item';
            item.setAttribute('role', 'listitem');
            item.setAttribute('tabindex', '0');
            
            item.innerHTML = `
                <div class="favorite-info">
                    <div class="favorite-name">${SecurityUtils.sanitize(fav.name)}</div>
                    <div class="favorite-temp">${fav.lastTemp || '--'}${WeatherConfig.UNITS[AppState.currentUnit].temp}</div>
                </div>
                <div class="favorite-actions">
                    <button class="favorite-btn" aria-label="Ver clima de ${fav.name}" data-action="view">
                        <span aria-hidden="true">🔍</span>
                    </button>
                    <button class="favorite-btn remove" aria-label="Eliminar ${fav.name} de favoritos" data-action="remove">
                        <span aria-hidden="true">✕</span>
                    </button>
                </div>
            `;
            
            // Event listeners
            item.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="view"]')) {
                    this.loadFavoriteWeather(fav);
                } else if (e.target.closest('[data-action="remove"]')) {
                    this.removeFavorite(fav.id);
                } else {
                    this.loadFavoriteWeather(fav);
                }
            });
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.loadFavoriteWeather(fav);
                }
            });
            
            DOM.favoritesList.appendChild(item);
        });
        
        // Actualizar temperaturas de favoritos en segundo plano
        this.updateFavoriteTemperatures();
    },
    
    /**
     * Actualiza temperaturas de favoritos
     */
    async updateFavoriteTemperatures() {
        const promises = AppState.favorites.map(async (fav) => {
            try {
                const weather = await WeatherAPI.getWeatherByCity(fav.name);
                fav.lastTemp = weather.temp;
                fav.lastUpdate = new Date().toISOString();
                return fav;
            } catch (error) {
                console.error(`Error al actualizar ${fav.name}:`, error);
                return fav;
            }
        });
        
        const updatedFavorites = await Promise.all(promises);
        AppState.favorites = updatedFavorites;
        AppState.saveToStorage();
        
        // Actualizar solo si la lista está visible
        if (!DOM.emptyFavorites.hidden) {
            this.updateFavorites();
        }
    },
    
    /**
     * Actualiza historial de búsquedas
     */
    updateHistory() {
        if (AppState.searchHistory.length === 0) {
            DOM.historyList.innerHTML = '<p class="empty-state">No hay búsquedas recientes</p>';
            return;
        }
        
        DOM.historyList.innerHTML = '';
        
        AppState.searchHistory.slice(0, 10).forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('role', 'listitem');
            
            const timeAgo = this.getTimeAgo(new Date(item.timestamp));
            
            historyItem.innerHTML = `
                <div>
                    <strong>${SecurityUtils.sanitize(item.city)}</strong>
                    ${item.country ? `, ${item.country}` : ''}
                </div>
                <div class="time" title="${new Date(item.timestamp).toLocaleString('es')}">
                    ${timeAgo}
                </div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.loadFromHistory(item);
            });
            
            DOM.historyList.appendChild(historyItem);
        });
    },
    
    /**
     * Muestra sugerencias de búsqueda
     */
    async showSuggestions(query) {
        if (!query || query.length < 2) {
            DOM.suggestions.hidden = true;
            return;
        }
        
        try {
            const suggestions = await WeatherAPI.getCitySuggestions(query);
            
            if (suggestions.length === 0) {
                DOM.suggestions.hidden = true;
                return;
            }
            
            DOM.suggestions.innerHTML = '';
            suggestions.forEach((suggestion, index) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.setAttribute('role', 'option');
                item.setAttribute('tabindex', '0');
                
                item.innerHTML = `
                    <span class="suggestion-icon" aria-hidden="true">📍</span>
                    <span>${SecurityUtils.sanitize(suggestion.displayName)}</span>
                `;
                
                item.addEventListener('click', () => {
                    this.selectSuggestion(suggestion);
                });
                
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectSuggestion(suggestion);
                    }
                });
                
                DOM.suggestions.appendChild(item);
            });
            
            DOM.suggestions.hidden = false;
            
        } catch (error) {
            console.error('Error al obtener sugerencias:', error);
            DOM.suggestions.hidden = true;
        }
    },
    
    /**
     * Selecciona una sugerencia
     */
    selectSuggestion(suggestion) {
        DOM.citySearch.value = suggestion.displayName;
        DOM.suggestions.hidden = true;
        this.searchWeather(suggestion.name);
    },
    
    /**
     * Toggle de favoritos
     */
    toggleFavorite(weatherData) {
        const index = AppState.favorites.findIndex(fav => fav.id === weatherData.id);
        
        if (index > -1) {
            // Remover de favoritos
            AppState.favorites.splice(index, 1);
            UI.showToast(`❌ ${weatherData.name} eliminado de favoritos`, 'info');
        } else {
            // Agregar a favoritos
            if (AppState.favorites.length >= WeatherConfig.MAX_FAVORITES) {
                UI.showModal('error', 'Límite de favoritos alcanzado', 'Solo puedes tener hasta 10 ciudades favoritas.');
                return;
            }
            
            AppState.favorites.push({
                id: weatherData.id,
                name: weatherData.name,
                country: weatherData.country,
                lat: weatherData.coord.lat,
                lon: weatherData.coord.lon,
                lastTemp: weatherData.temp,
                lastUpdate: new Date().toISOString()
            });
            
            UI.showToast(`⭐ ${weatherData.name} agregado a favoritos`, 'success');
        }
        
        AppState.saveToStorage();
        this.updateFavorites();
        this.updateCurrentWeather(weatherData); // Actualizar botón
    },
    
    /**
     * Elimina un favorito
     */
    removeFavorite(id) {
        AppState.favorites = AppState.favorites.filter(fav => fav.id !== id);
        AppState.saveToStorage();
        this.updateFavorites();
        UI.showToast('Ciudad eliminada de favoritos', 'info');
    },
    
    /**
     * Carga clima desde favoritos
     */
    async loadFavoriteWeather(fav) {
        try {
            UI.setLoading(true);
            const weather = await WeatherAPI.getWeatherByCity(fav.name);
            this.updateCurrentWeather(weather);
            
            // Obtener pronóstico
            const forecast = await WeatherAPI.getForecast(fav.lat, fav.lon);
            this.updateForecast(forecast);
            
        } catch (error) {
            UI.showError(`Error al cargar ${fav.name}: ${error.message}`);
        } finally {
            UI.setLoading(false);
        }
    },
    
    /**
     * Carga desde historial
     */
    async loadFromHistory(item) {
        try {
            UI.setLoading(true);
            const weather = await WeatherAPI.getWeatherByCoords(item.lat, item.lon);
            this.updateCurrentWeather(weather);
            
            const forecast = await WeatherAPI.getForecast(item.lat, item.lon);
            this.updateForecast(forecast);
            
        } catch (error) {
            UI.showError(`Error al cargar desde historial: ${error.message}`);
        } finally {
            UI.setLoading(false);
        }
    },
    
    /**
     * Busca clima
     */
    async searchWeather(city) {
        const validation = SecurityUtils.validateCityName(city);
        
        if (!validation.isValid) {
            UI.showError(validation.error);
            return;
        }
        
        try {
            UI.setLoading(true);
            const weather = await WeatherAPI.getWeatherByCity(validation.value);
            this.updateCurrentWeather(weather);
            
            const forecast = await WeatherAPI.getForecast(weather.coord.lat, weather.coord.lon);
            this.updateForecast(forecast);
            
            UI.showToast(`✅ Clima de ${weather.name} cargado`, 'success');
            
        } catch (error) {
            UI.showError(error.message, () => this.searchWeather(city));
        } finally {
            UI.setLoading(false);
            DOM.suggestions.hidden = true;
        }
    },
    
    /**
     * Usa geolocalización
     */
    async useGeolocation() {
        if (!'geolocation' in navigator) {
            UI.showError('Geolocalización no soportada en este navegador');
            return;
        }
        
        try {
            UI.setLoading(true);
            UI.showToast('📍 Obteniendo ubicación...', 'info');
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            
            const weather = await WeatherAPI.getWeatherByCoords(
                position.coords.latitude,
                position.coords.longitude
            );
            
            this.updateCurrentWeather(weather);
            
            const forecast = await WeatherAPI.getForecast(
                position.coords.latitude,
                position.coords.longitude
            );
            
            this.updateForecast(forecast);
            UI.showToast(`📍 Clima de tu ubicación cargado`, 'success');
            
        } catch (error) {
            let errorMessage = 'Error al obtener ubicación';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permiso de ubicación denegado';
                    UI.showModal('permission', 'Permiso requerido', 
                        'Para usar tu ubicación, necesitas permitir el acceso en la configuración de tu navegador.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Información de ubicación no disponible';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Tiempo de espera agotado';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            UI.showError(errorMessage, () => this.useGeolocation());
            
        } finally {
            UI.setLoading(false);
        }
    },
    
    /**
     * Cambia unidades
     */
    toggleUnits() {
        AppState.currentUnit = AppState.currentUnit === 'metric' ? 'imperial' : 'metric';
        
        // Actualizar botón
        DOM.unitToggle.setAttribute('aria-pressed', AppState.currentUnit === 'metric');
        DOM.unitToggle.setAttribute('data-unit', AppState.currentUnit);
        
        // Recargar datos si hay clima actual
        if (AppState.currentWeather) {
            this.searchWeather(AppState.currentWeather.name);
        }
        
        UI.showToast(`Unidades cambiadas a ${AppState.currentUnit === 'metric' ? 'Celsius' : 'Fahrenheit'}`, 'info');
    },
    
    /**
     * Muestra modal
     */
    showModal(type, title, message, actions = null) {
        const modal = DOM[`${type}Modal`];
        if (!modal) return;
        
        const titleElement = modal.querySelector('.modal-title');
        const messageElement = modal.querySelector('#modalDescription');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        
        modal.hidden = false;
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Atrapar focus dentro del modal
        const firstFocusable = modal.querySelector('button, input, [tabindex]');
        if (firstFocusable) firstFocusable.focus();
        
        // Configurar acciones personalizadas
        if (actions) {
            const actionsContainer = modal.querySelector('.modal-actions');
            if (actionsContainer) {
                actionsContainer.innerHTML = '';
                actions.forEach(action => {
                    const button = document.createElement('button');
                    button.className = `btn btn-${action.type || 'primary'}`;
                    button.textContent = action.label;
                    button.onclick = action.callback;
                    actionsContainer.appendChild(button);
                });
            }
        }
    },
    
    /**
     * Oculta modal
     */
    hideModal(type) {
        const modal = DOM[`${type}Modal`];
        if (!modal) return;
        
        modal.classList.remove('active');
        setTimeout(() => modal.hidden = true, 300);
    },
    
    /**
     * Muestra toast
     */
    showToast(message, type = 'info') {
        const icon = type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠️' : 'ℹ️';
        
        DOM.toastMessage.textContent = `${icon} ${message}`;
        
        // Actualizar color según tipo
        const toast = DOM.toast;
        toast.style.background = type === 'success' ? 'var(--color-accent)' :
                                type === 'error' ? 'var(--color-danger)' :
                                type === 'warning' ? 'var(--color-warning)' :
                                'var(--color-gray-800)';
        
        // Mostrar toast
        toast.hidden = false;
        toast.classList.add('show');
        
        // Ocultar después de tiempo
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.hidden = true;
            }, 300);
        }, 3000);
    },
    
    /**
     * Anuncia actualización a lectores de pantalla
     */
    announceWeatherUpdate(weatherData) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        
        announcement.textContent = `Clima actualizado para ${weatherData.name}: ${weatherData.temp} grados, ${weatherData.weather.description}`;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 100);
    },
    
    /**
     * Utilitarios
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    formatCoords(lat, lon) {
        return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    },
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'ahora';
        if (diffMins < 60) return `hace ${diffMins} min`;
        if (diffHours < 24) return `hace ${diffHours} h`;
        if (diffDays < 7) return `hace ${diffDays} d`;
        return date.toLocaleDateString('es');
    },
    
    isNightTime(weatherData) {
        const now = new Date();
        const localTime = new Date(now.getTime() + weatherData.timezone * 1000);
        const hour = localTime.getHours();
        return hour < 6 || hour >= 18;
    },
    
    getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Smoke': '💨',
            'Haze': '🌫️',
            'Dust': '🌪️',
            'Fog': '🌫️',
            'Sand': '🌪️',
            'Ash': '🌋',
            'Squall': '💨',
            'Tornado': '🌪️'
        };
        return icons[condition] || '🌤️';
    },
    
    getWeatherEmoji(condition) {
        const emojis = {
            'Clear': 'Día soleado',
            'Clouds': 'Nublado',
            'Rain': 'Lluvia',
            'Drizzle': 'Llovizna',
            'Thunderstorm': 'Tormenta',
            'Snow': 'Nieve',
            'Mist': 'Neblina'
        };
        return emojis[condition] || condition;
    }
};

/**
 * MÓDULO: Controladores de eventos
 */
const EventHandlers = {
    /**
     * Configura todos los event listeners
     */
    init() {
        this.setupSearch();
        this.setupActions();
        this.setupModals();
        this.setupKeyboardShortcuts();
    },
    
    /**
     * Configura eventos de búsqueda
     */
    setupSearch() {
        // Formulario de búsqueda
        DOM.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = DOM.citySearch.value.trim();
            if (city) {
                UI.searchWeather(city);
            }
        });
        
        // Input con debouncing para sugerencias
        let suggestionTimeout;
        DOM.citySearch.addEventListener('input', (e) => {
            clearTimeout(suggestionTimeout);
            suggestionTimeout = setTimeout(() => {
                UI.showSuggestions(e.target.value);
            }, 300);
        });
        
        // Ocultar sugerencias al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!DOM.suggestions.contains(e.target) && e.target !== DOM.citySearch) {
                DOM.suggestions.hidden = true;
            }
        });
        
        // Navegación por teclado en sugerencias
        DOM.citySearch.addEventListener('keydown', (e) => {
            const suggestions = DOM.suggestions.querySelectorAll('.suggestion-item');
            
            if (!suggestions.length || DOM.suggestions.hidden) return;
            
            let currentIndex = -1;
            suggestions.forEach((item, index) => {
                if (item === document.activeElement) {
                    currentIndex = index;
                }
            });
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
                    suggestions[nextIndex].focus();
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
                    suggestions[prevIndex].focus();
                    break;
                    
                case 'Escape':
                    DOM.suggestions.hidden = true;
                    break;
            }
        });
    },
    
    /**
     * Configura eventos de acciones
     */
    setupActions() {
        // Botón de ubicación
        DOM.locationBtn.addEventListener('click', () => {
            UI.useGeolocation();
        });
        
        // Botón de cambio de unidades
        DOM.unitToggle.addEventListener('click', () => {
            UI.toggleUnits();
        });
        
        // Toggle de pronóstico
        DOM.toggleForecast.addEventListener('click', () => {
            const isExpanded = DOM.toggleForecast.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;
            
            DOM.toggleForecast.setAttribute('aria-expanded', newState);
            DOM.forecastGrid.hidden = !newState;
            DOM.toggleForecast.querySelector('.toggle-text').textContent = 
                newState ? 'Ocultar pronóstico' : 'Mostrar pronóstico';
            DOM.toggleForecast.querySelector('.toggle-icon').style.transform = 
                newState ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
        
        // Gestión de favoritos
        DOM.manageFavorites.addEventListener('click', () => {
            UI.showModal('permission', 'Gestión de Favoritos', 
                'Aquí puedes gestionar tus ciudades favoritas. Usa los botones de importar/exportar para respaldar tu lista.');
        });
        
        DOM.importFavorites.addEventListener('click', () => {
            this.importFavorites();
        });
        
        DOM.exportFavorites.addEventListener('click', () => {
            this.exportFavorites();
        });
        
        DOM.clearFavorites.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar todas las ciudades favoritas?')) {
                AppState.favorites = [];
                AppState.saveToStorage();
                UI.updateFavorites();
                UI.showToast('Favoritos eliminados', 'success');
            }
        });
        
        // Botón de reintento
        DOM.retryBtn.addEventListener('click', () => {
            if (AppState.currentWeather) {
                UI.searchWeather(AppState.currentWeather.name);
            } else {
                UI.useGeolocation();
            }
        });
    },
    
    /**
     * Configura eventos de modales
     */
    setupModals() {
        // Cerrar modales
        DOM.closeModalBtn.addEventListener('click', () => {
            UI.hideModal('error');
        });
        
        DOM.grantPermissionBtn.addEventListener('click', () => {
            UI.hideModal('permission');
            UI.useGeolocation();
        });
        
        // Cerrar modales al hacer clic fuera
        [DOM.errorModal, DOM.permissionModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                    UI.hideModal(modal.id.replace('Modal', ''));
                }
            });
        });
        
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!DOM.errorModal.hidden) UI.hideModal('error');
                if (!DOM.permissionModal.hidden) UI.hideModal('permission');
            }
        });
    },
    
    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para buscar
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                DOM.citySearch.focus();
                DOM.citySearch.select();
            }
            
            // Ctrl/Cmd + L para ubicación
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                UI.useGeolocation();
            }
            
            // Ctrl/Cmd + U para cambiar unidades
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                UI.toggleUnits();
            }
            
            // Escape para limpiar búsqueda
            if (e.key === 'Escape' && document.activeElement === DOM.citySearch) {
                DOM.citySearch.value = '';
                DOM.suggestions.hidden = true;
            }
        });
    },
    
    /**
     * Importa favoritos desde JSON
     */
    importFavorites() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    
                    if (!Array.isArray(imported)) {
                        throw new Error('Formato de archivo inválido');
                    }
                    
                    // Validar y limitar importación
                    const validFavorites = imported
                        .filter(fav => fav.name && fav.lat && fav.lon)
                        .slice(0, WeatherConfig.MAX_FAVORITES);
                    
                    AppState.favorites = SecurityUtils.limitFavorites([
                        ...AppState.favorites,
                        ...validFavorites
                    ]);
                    
                    AppState.saveToStorage();
                    UI.updateFavorites();
                    UI.showToast(`${validFavorites.length} favoritos importados`, 'success');
                    
                } catch (error) {
                    UI.showError('Error al importar favoritos: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    },
    
    /**
     * Exporta favoritos a JSON
     */
    exportFavorites() {
        if (AppState.favorites.length === 0) {
            UI.showToast('No hay favoritos para exportar', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify(AppState.favorites, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `clima-favoritos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        UI.showToast('Favoritos exportados exitosamente', 'success');
    }
};

/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
class WeatherApp {
    static async init() {
        try {
            console.log('🌤️ Inicializando App del Clima...');
            
            // Inicializar estado
            AppState.init();
            
            // Configurar eventos
            EventHandlers.init();
            
            // Inicializar UI
            UI.updateFavorites();
            UI.updateHistory();
            
            // Configurar unidad inicial
            DOM.unitToggle.setAttribute('aria-pressed', AppState.currentUnit === 'metric');
            DOM.unitToggle.setAttribute('data-unit', AppState.currentUnit);
            
            // Intentar cargar clima inicial
            await this.loadInitialWeather();
            
            // Mostrar mensaje de bienvenida
            setTimeout(() => {
                UI.showToast('App del Clima lista', 'success');
            }, 1000);
            
            console.log('✅ App del Clima inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            UI.showError('Error al inicializar la aplicación');
        }
    }
    
    static async loadInitialWeather() {
        // Intentar usar ubicación primero
        if ('geolocation' in navigator) {
            const permission = await navigator.permissions?.query({ name: 'geolocation' });
            
            if (permission?.state === 'granted') {
                await UI.useGeolocation();
                return;
            }
        }
        
        // Si no hay ubicación, usar primer favorito
        if (AppState.favorites.length > 0) {
            await UI.loadFavoriteWeather(AppState.favorites[0]);
            return;
        }
        
        // Si no hay favoritos, usar ciudad por defecto
        await UI.searchWeather('Madrid');
    }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WeatherApp.init());
} else {
    WeatherApp.init();
}

// Exportar para testing (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WeatherApp,
        WeatherAPI,
        AppState,
        UI
    };
}
