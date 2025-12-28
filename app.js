// Weatherbit API Configuration
const WEATHERBIT_CONFIG = {
    apiKey: '17209dfbbbe34f0d87d2f6af1ecfdc8c',
    baseUrl: 'https://api.weatherbit.io/v2.0',
    units: 'M',
    lang: 'ru'
};

// DOM Elements
const elements = {
    // Новые элементы для темы
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    themeText: document.getElementById('themeText'),
    
    // Существующие элементы
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
    // ... (оставьте без изменений)
    '01d': 'fa-sun',
    '01n': 'fa-moon',
    '02d': 'fa-cloud-sun',
    '02n': 'fa-cloud-moon',
    '03d': 'fa-cloud',
    '03n': 'fa-cloud',
    '04d': 'fa-cloud',
    '04n': 'fa-cloud',
    '09d': 'fa-cloud-showers-heavy',
    '09n': 'fa-cloud-showers-heavy',
    '10d': 'fa-cloud-sun-rain',
    '10n': 'fa-cloud-moon-rain',
    '11d': 'fa-bolt',
    '11n': 'fa-bolt',
    '13d': 'fa-snowflake',
    '13n': 'fa-snowflake',
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

// Theme Management
const ThemeManager = {
    currentTheme: 'light',
    
    init() {
        // Загружаем сохраненную тему из localStorage
        const savedTheme = localStorage.getItem('weatherTheme') || 'light';
        this.setTheme(savedTheme);
        
        // Назначаем обработчик клика
        elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    },
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('weatherTheme', theme);
        
        // Обновляем иконку и текст кнопки
        this.updateThemeButton();
    },
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Добавляем анимацию переключения
        this.addThemeTransition();
    },
    
    updateThemeButton() {
        if (this.currentTheme === 'dark') {
            elements.themeIcon.className = 'fas fa-sun';
            elements.themeText.textContent = 'Светлая тема';
            elements.themeToggle.title = 'Переключить на светлую тему';
        } else {
            elements.themeIcon.className = 'fas fa-moon';
            elements.themeText.textContent = 'Тёмная тема';
            elements.themeToggle.title = 'Переключить на тёмную тему';
        }
    },
    
    addThemeTransition() {
        // Добавляем класс для плавного перехода
        document.body.classList.add('theme-transitioning');
        
        // Убираем класс после завершения анимации
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 500);
    },
    
    // Метод для проверки системных настроек
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем менеджер темы
    ThemeManager.init();
    
    // Показываем превью API ключа
    const apiKey = WEATHERBIT_CONFIG.apiKey;
    elements.apiKeyPreview.textContent = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 5)}`;
    
    // Загружаем последний город
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
    
    // Автоматическое определение темы системы (опционально)
    // Если пользователь не выбрал тему вручную
    if (!localStorage.getItem('weatherTheme')) {
        const systemTheme = ThemeManager.detectSystemTheme();
        if (systemTheme !== ThemeManager.currentTheme) {
            setTimeout(() => {
                ThemeManager.setTheme(systemTheme);
            }, 1000);
        }
    }
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
        const weatherUrl = `${WEATHERBIT_CONFIG.baseUrl}/current?city=${encodeURIComponent(city)}&units=${WEATHERBIT_CONFIG.units}&lang=${WEATHERBIT_CONFIG.lang}&key=${WEATHERBIT_CONFIG.apiKey}`;
        const aqiUrl = `${WEATHERBIT_CONFIG.baseUrl}/current/airquality?city=${encodeURIComponent(city)}&key=${WEATHERBIT_CONFIG.apiKey}`;
        
        const [weatherResponse, aqiResponse] = await Promise.allSettled([
            fetch(weatherUrl),
            fetch(aqiUrl)
        ]);
        
        if (weatherResponse.status === 'rejected') {
            throw new Error('Ошибка сети при запросе погоды');
        }
        
        if (!weatherResponse.value.ok) {
            const errorData = await weatherResponse.value.json().catch(() => ({}));
            throw new Error(errorData.error || `Ошибка ${weatherResponse.value.status}`);
        }
        
        const weatherData = await weatherResponse.value.json();
        
        if (!weatherData.data || weatherData.data.length === 0) {
            throw new Error('Город не найден или нет данных о погоде');
        }
        
        const currentWeather = weatherData.data[0];
        
        let airQualityData = null;
        if (aqiResponse.status === 'fulfilled' && aqiResponse.value.ok) {
            airQualityData = await aqiResponse.value.json();
        }
        
        updateApiUsageInfo(weatherResponse.value.headers);
        displayWeather(currentWeather, airQualityData);
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
    // Город и страна
    elements.cityName.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.city_name}`;
    elements.countryCode.textContent = data.country_code || '--';
    
    // Дата и время
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
    
    // Температура
    elements.temperature.textContent = Math.round(data.temp);
    elements.feelsLike.textContent = `${Math.round(data.app_temp)}°C`;
    
    // Другие параметры
    elements.humidity.textContent = `${data.rh}%`;
    elements.windSpeed.textContent = `${data.wind_spd.toFixed(1)} м/с`;
    elements.pressure.textContent = `${Math.round(data.pres)} hPa`;
    elements.tempMin.textContent = `${Math.round(data.min_temp || data.temp - 2)}°C`;
    elements.tempMax.textContent = `${Math.round(data.max_temp || data.temp + 2)}°C`;
    elements.visibility.textContent = `${(data.vis / 1000).toFixed(1)} км`;
    elements.uvIndex.textContent = data.uv ? data.uv.toFixed(1) : '--';
    
    // Восход и закат
    if (data.sunrise && data.sunset) {
        elements.sunrise.textContent = formatTime(data.sunrise);
        elements.sunset.textContent = formatTime(data.sunset);
    }
    
    // Описание погоды
    const description = data.weather.description;
    elements.weatherDescription.textContent = description;
    elements.weatherDetails.textContent = `Обновлено: ${formatTime(data.ob_time || now.toISOString())}`;
    
    // Иконка погоды
    const iconCode = data.weather.icon;
    const iconClass = WEATHER_ICONS[iconCode] || 'fa-cloud';
    elements.weatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    elements.descIcon.className = `fas ${iconClass}`;
    
    // Качество воздуха
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
    console.info(message);
}