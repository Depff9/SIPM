// Weatherbit API Configuration
const WEATHERBIT_CONFIG = {
    apiKey: '17209dfbbbe34f0d87d2f6af1ecfdc8c', // Ваш ключ
    baseUrl: 'https://api.weatherbit.io/v2.0',
    units: 'M', // M = metric (Celsius, m/s)
    lang: 'ru'
};

// DOM Elements
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    weatherCard: document.getElementById('weatherCard'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    infoMessage: document.getElementById('infoMessage'),
    apiCalls: document.getElementById('apiCalls'),
    
    // Display elements
    cityName: document.getElementById('cityName'),
    currentDateTime: document.getElementById('currentDateTime'),
    countryBadge: document.getElementById('countryBadge'),
    countryCode: document.getElementById('countryCode'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherDescription: document.getElementById('weatherDescription'),
    weatherDetails: document.getElementById('weatherDetails'),
    descIcon: document.getElementById('descIcon'),
    tempMin: document.getElementById('tempMin'),
    tempMax: document.getElementById('tempMax'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    visibility: document.getElementById('visibility'),
    uvIndex: document.getElementById('uvIndex'),
    airQualitySection: document.getElementById('airQualitySection'),
    aqiValue: document.getElementById('aqiValue'),
    aqiLevel: document.getElementById('aqiLevel'),
    apiStatus: document.getElementById('apiStatus'),
    apiKeyPreview: document.getElementById('apiKeyPreview')
};

// Weather Icons Mapping
const WEATHER_ICONS = {
    // Clear
    '01d': 'fa-sun',
    '01n': 'fa-moon',
    
    // Few clouds
    '02d': 'fa-cloud-sun',
    '02n': 'fa-cloud-moon',
    
    // Scattered clouds
    '03d': 'fa-cloud',
    '03n': 'fa-cloud',
    
    // Broken clouds
    '04d': 'fa-cloud',
    '04n': 'fa-cloud',
    
    // Shower rain
    '09d': 'fa-cloud-showers-heavy',
    '09n': 'fa-cloud-showers-heavy',
    
    // Rain
    '10d': 'fa-cloud-sun-rain',
    '10n': 'fa-cloud-moon-rain',
    
    // Thunderstorm
    '11d': 'fa-bolt',
    '11n': 'fa-bolt',
    
    // Snow
    '13d': 'fa-snowflake',
    '13n': 'fa-snowflake',
    
    // Mist
    '50d': 'fa-smog',
    '50n': 'fa-smog'
};

// AQI Levels
const AQI_LEVELS = [
    { min: 0, max: 50, level: 'Отлично', color: '#2ecc71', emoji: '😊' },
    { min: 51, max: 100, level: 'Хорошо', color: '#f1c40f', emoji: '🙂' },
    { min: 101, max: 150, level: 'Удовлетворительно', color: '#e67e22', emoji: '😐' },
    { min: 151, max: 200, level: 'Плохо', color: '#e74c3c', emoji: '😷' },
    { min: 201, max: 300, level: 'Очень плохо', color: '#9b59b6', emoji: '🤢' },
    { min: 301, max: 500, level: 'Опасно', color: '#8e44ad', emoji: '☠️' }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Show API key preview (first 6 and last 5 characters)
    const apiKey = WEATHERBIT_CONFIG.apiKey;
    elements.apiKeyPreview.textContent = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 5)}`;
    
    // Load last searched city or default
    const lastCity = localStorage.getItem('lastCity') || 'Moscow';
    elements.cityInput.value = lastCity;
    getWeather(lastCity);
    
    // Event Listeners
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    elements.locationBtn.addEventListener('click', getWeatherByLocation);
    
    // Quick cities buttons
    document.querySelectorAll('.quick-city').forEach(button => {
        button.addEventListener('click', function() {
            const city = this.getAttribute('data-city');
            elements.cityInput.value = city;
            getWeather(city);
        });
    });
});

// Handle Search
function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
}

// Get Weather by City Name
async function getWeather(city) {
    showLoading(true);
    hideError();
    hideWeatherCard();
    
    try {
        // Current weather
        const weatherUrl = `${WEATHERBIT_CONFIG.baseUrl}/current?city=${encodeURIComponent(city)}&units=${WEATHERBIT_CONFIG.units}&lang=${WEATHERBIT_CONFIG.lang}&key=${WEATHERBIT_CONFIG.apiKey}`;
        
        // Air quality
        const aqiUrl = `${WEATHERBIT_CONFIG.baseUrl}/current/airquality?city=${encodeURIComponent(city)}&key=${WEATHERBIT_CONFIG.apiKey}`;
        
        // Fetch both requests in parallel
        const [weatherResponse, aqiResponse] = await Promise.allSettled([
            fetch(weatherUrl),
            fetch(aqiUrl)
        ]);
        
        // Handle weather response
        if (weatherResponse.status === 'rejected') {
            throw new Error('Ошибка сети при запросе погоды');
        }
        
        if (!weatherResponse.value.ok) {
            const errorData = await weatherResponse.value.json().catch(() => ({}));
            throw new Error(errorData.error || `Ошибка ${weatherResponse.value.status}`);
        }
        
        const weatherData = await weatherResponse.value.json();
        
        // Check if we have data
        if (!weatherData.data || weatherData.data.length === 0) {
            throw new Error('Город не найден или нет данных о погоде');
        }
        
        const currentWeather = weatherData.data[0];
        
        // Handle air quality response
        let airQualityData = null;
        if (aqiResponse.status === 'fulfilled' && aqiResponse.value.ok) {
            airQualityData = await aqiResponse.value.json();
        }
        
        // Update API usage info from headers
        updateApiUsageInfo(weatherResponse.value.headers);
        
        // Display weather data
        displayWeather(currentWeather, airQualityData);
        
        // Save to localStorage
        localStorage.setItem('lastCity', city);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Get Weather by Location
async function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Геолокация не поддерживается вашим браузером');
        return;
    }
    
    showLoading(true);
    hideError();
    hideWeatherCard();
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 60000
            });
        });
        
        const { latitude, longitude } = position.coords;
        
        const weatherUrl = `${WEATHERBIT_CONFIG.baseUrl}/current?lat=${latitude}&lon=${longitude}&units=${WEATHERBIT_CONFIG.units}&lang=${WEATHERBIT_CONFIG.lang}&key=${WEATHERBIT_CONFIG.apiKey}`;
        
        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Ошибка ${response.status}`);
        }
        
        const weatherData = await response.json();
        
        if (!weatherData.data || weatherData.data.length === 0) {
            throw new Error('Нет данных о погоде для вашего местоположения');
        }
        
        const currentWeather = weatherData.data[0];
        
        // Update API usage info
        updateApiUsageInfo(response.headers);
        
        displayWeather(currentWeather);
        elements.cityInput.value = currentWeather.city_name;
        localStorage.setItem('lastCity', currentWeather.city_name);
        
    } catch (error) {
        if (error.code === error.PERMISSION_DENIED) {
            showError('Доступ к геолокации отклонен. Разрешите доступ в настройках браузера.');
        } else if (error.code === error.TIMEOUT) {
            showError('Таймаут запроса геолокации. Проверьте настройки браузера.');
        } else {
            showError(`Ошибка определения местоположения: ${error.message}`);
        }
    } finally {
        showLoading(false);
    }
}

// Display Weather Data
function displayWeather(data, airQuality = null) {
    // City and country
    elements.cityName.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.city_name}`;
    elements.countryCode.textContent = data.country_code || '--';
    
    // Date and time
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    elements.currentDateTime.textContent = now.toLocaleDateString('ru-RU', options);
    
    // Temperature and feels like
    elements.temperature.textContent = Math.round(data.temp);
    elements.feelsLike.textContent = `${Math.round(data.app_temp)}°C`;
    
    // Other measurements
    elements.humidity.textContent = `${data.rh}%`;
    elements.windSpeed.textContent = `${data.wind_spd.toFixed(1)} м/с`;
    elements.pressure.textContent = `${Math.round(data.pres)} hPa`;
    elements.tempMin.textContent = `${Math.round(data.min_temp || data.temp - 2)}°C`;
    elements.tempMax.textContent = `${Math.round(data.max_temp || data.temp + 2)}°C`;
    elements.visibility.textContent = `${(data.vis / 1000).toFixed(1)} км`;
    elements.uvIndex.textContent = data.uv ? data.uv.toFixed(1) : '--';
    
    // Sunrise and sunset
    if (data.sunrise && data.sunset) {
        elements.sunrise.textContent = formatTime(data.sunrise);
        elements.sunset.textContent = formatTime(data.sunset);
    }
    
    // Weather description and icon
    const description = data.weather.description;
    elements.weatherDescription.textContent = description;
    elements.weatherDetails.textContent = `Обновлено: ${formatTime(data.ob_time || now.toISOString())}`;
    
    // Set weather icon
    const iconCode = data.weather.icon;
    const iconClass = WEATHER_ICONS[iconCode] || 'fa-cloud';
    elements.weatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    elements.descIcon.className = `fas ${iconClass}`;
    
    // Air quality
    if (airQuality && airQuality.data && airQuality.data.length > 0) {
        const aqi = airQuality.data[0].aqi;
        const level = getAQILevel(aqi);
        
        elements.aqiValue.textContent = aqi;
        elements.aqiValue.style.color = level.color;
        elements.aqiLevel.textContent = `${level.level} ${level.emoji}`;
        elements.aqiLevel.style.color = level.color;
        
        elements.airQualitySection.style.display = 'block';
    } else {
        elements.airQualitySection.style.display = 'none';
    }
    
    // Show weather card
    showWeatherCard();
}

// Get AQI Level
function getAQILevel(aqi) {
    const level = AQI_LEVELS.find(l => aqi >= l.min && aqi <= l.max);
    return level || AQI_LEVELS[AQI_LEVELS.length - 1];
}

// Format time
function formatTime(timeString) {
    const time = new Date(timeString);
    return time.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Update API usage info from headers
function updateApiUsageInfo(headers) {
    const remaining = headers.get('x-ratelimit-remaining');
    const limit = headers.get('x-ratelimit-limit');
    
    if (remaining && limit) {
        elements.apiCalls.textContent = `${remaining}/${limit}`;
        elements.apiStatus.textContent = 'Активен';
        elements.apiStatus.style.color = '#2ecc71';
        
        // Show warning if low on requests
        if (parseInt(remaining) < 50) {
            showInfo(`Осталось мало запросов: ${remaining}`);
        }
    }
}

// UI Helper Functions
function showLoading(show) {
    if (show) {
        elements.loading.classList.add('active');
    } else {
        elements.loading.classList.remove('active');
    }
}

function showWeatherCard() {
    elements.weatherCard.classList.add('active');
}

function hideWeatherCard() {
    elements.weatherCard.classList.remove('active');
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.style.display = 'flex';
    setTimeout(() => {
        elements.errorMessage.style.opacity = '1';
    }, 10);
}

function hideError() {
    elements.errorMessage.style.opacity = '0';
    setTimeout(() => {
        elements.errorMessage.style.display = 'none';
    }, 300);
}

function showInfo(message) {
    // You can implement a temporary info message system here
    console.info(message);
}