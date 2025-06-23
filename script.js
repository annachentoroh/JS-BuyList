const apiKey = "JPDXUD873WWQCFU96TPB22D7L"; 
const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");
const cityElement = document.querySelector(".location-info h1");
const countryElement = document.querySelector(".location-info p");
const temperatureElement = document.querySelector(".location-info .temperature");
const descriptionElement = document.querySelector(".location-info .description");
const windElement = document.querySelector(".details p:first-child");
const humidityElement = document.querySelector(".details p:last-child");
const currentWeatherIcon = document.querySelector(".weather-icon-current img");
const forecastCarousel = document.querySelector(".forecast-carousel");

let currentWeatherData = null; 

// Функція для отримання даних погоди
async function getWeatherData(location) {
    try {
        const today = new Date(); // Отримуємо поточну дату та дату через 10 днів для запиту діапазону
        const next10Days = new Date();
        next10Days.setDate(today.getDate() + 9); 

        const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const next10DaysFormatted = next10Days.toISOString().split('T')[0]; // YYYY-MM-DD

        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${todayFormatted}/${next10DaysFormatted}?unitGroup=metric&include=days,current&key=${apiKey}&contentType=json`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Помилка API: ${response.statusText}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Помилка отримання даних погоди:", error);
        alert("Не вдалося отримати дані погоди. Перевірте назву міста або спробуйте пізніше.");
        return null;
    }
}

// Функція для оновлення поточної погоди та прогнозу
function updateWeatherUI(data) {
    if (!data) return;
    cityElement.textContent = data.resolvedAddress.split(',')[0]; // Беремо тільки місто
    countryElement.textContent = data.resolvedAddress.split(',').slice(1).join(', ').trim(); 
    
    // Знаходимо поточні дані (з секції currentConditions або першого дня)
    const currentConditions = data.currentConditions || data.days[0];
    
    temperatureElement.textContent = `${Math.round(currentConditions.temp)}°C`;
    descriptionElement.textContent = currentConditions.conditions;
    windElement.textContent = `Wind: ${Math.round(currentConditions.windspeed)} km/h`;
    humidityElement.textContent = `Humidity: ${Math.round(currentConditions.humidity)}%`;
    currentWeatherIcon.src = `images/${getWeatherIcon(currentConditions.icon)}.png`; // Вибір іконки

    currentWeatherData = data; // Зберігаємо повні дані для попапу та зміни дня

    // Оновлення прогнозу на 10 днів
    forecastCarousel.innerHTML = ''; // Очищаємо карусель перед заповненням
    data.days.forEach((day, index) => {
        const forecastDayElement = document.createElement('div');
        forecastDayElement.classList.add('forecast-day');
        forecastDayElement.dataset.dayIndex = index; // Зберігаємо індекс дня для кліку

        let dayLabel = '';
        const date = new Date(day.datetime); // Отримуємо об'єкт Date для кожного дня

        if (index === 0) {
            dayLabel = 'Today';
        } else {
            dayLabel = date.toLocaleString('en-US', { weekday: 'short' }); // Наприклад, "Fri", "Sat"
        }

        forecastDayElement.innerHTML = `
            <p>${dayLabel}</p>
            <div class="weather-icon-small">
                <img src="images/${getWeatherIcon(day.icon)}.png" alt="${day.conditions} icon">
            </div>
            <p class="temp-high">${Math.round(day.tempmax)} °C</p>
            <p class="temp-low">${Math.round(day.tempmin)} °C</p>
        `;
        forecastCarousel.appendChild(forecastDayElement);
    });

    selectDay(0); 
}

// Допоміжна функція для вибору відповідної іконки
function getWeatherIcon(apiIcon) {
    if (apiIcon.includes("clear") || apiIcon.includes("sunny")) return "sun";
    if (apiIcon.includes("cloudy") || apiIcon.includes("partly-cloudy")) return "cloud";
    if (apiIcon.includes("rain")) return "rain";
    return "sun"; // Дефолтна іконка, якщо не знайдено відповідності
}

// Функція для встановлення "активного" дня та оновлення детальної інформації
function selectDay(index) {
    const forecastDays = document.querySelectorAll('.forecast-day');
    forecastDays.forEach((day, i) => {
        if (i === index) {
            day.classList.add('active-day'); 
            // Оновлюємо основну інформацію під "Today" з вибраним днем
            const selectedDayData = currentWeatherData.days[index];
            temperatureElement.textContent = `${Math.round(selectedDayData.temp)}°C`; // Використовуємо середню темп для вибраного дня
            descriptionElement.textContent = selectedDayData.conditions;
            windElement.textContent = `Wind: ${Math.round(selectedDayData.windspeed)} km/h`;
            humidityElement.textContent = `Humidity: ${Math.round(selectedDayData.humidity)}%`;
            currentWeatherIcon.src = `images/${getWeatherIcon(selectedDayData.icon)}.png`;
        } else {
            day.classList.remove('active-day');
        }
    });
}

// Обробник кліку на день прогнозу
forecastCarousel.addEventListener('click', (event) => {
    const clickedDay = event.target.closest('.forecast-day');
    if (clickedDay) {
        const index = parseInt(clickedDay.dataset.dayIndex);
        selectDay(index);
    }
});


// Обробник кліку на кнопку пошуку
searchButton.addEventListener('click', async () => {
    const location = searchInput.value;
    if (location) {
        const data = await getWeatherData(location);
        updateWeatherUI(data);
    }
});

// Обробник натискання Enter у полі пошуку
searchInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        const location = searchInput.value;
        if (location) {
            const data = await getWeatherData(location);
            updateWeatherUI(data);
        }
    }
});

// Попап з детальною інформацією 
const popup = document.createElement('div');
popup.classList.add('weather-popup');
popup.innerHTML = `
    <div class="popup-content">
        <span class="close-button">&times;</span>
        <h2>Деталі дня</h2>
        <p><strong>Дата:</strong> <span id="popup-date"></span></p>
        <p><strong>Температура:</strong> <span id="popup-temp"></span></p>
        <p><strong>Відчувається як:</strong> <span id="popup-feelslike"></span></p>
        <p><strong>Опади:</strong> <span id="popup-precip"></span></p>
        <p><strong>Вологість:</strong> <span id="popup-humidity"></span></p>
        <p><strong>Тиск:</strong> <span id="popup-pressure"></span></p>
        <p><strong>Швидкість вітру:</strong> <span id="popup-windspeed"></span></p>
        <p><strong>Пориви вітру:</strong> <span id="popup-windgust"></span></p>
        <p><strong>Напрямок вітру:</strong> <span id="popup-winddir"></span></p>
        <p><strong>Видимість:</strong> <span id="popup-visibility"></span></p>
        <p><strong>УФ-індекс:</strong> <span id="popup-uvindex"></span></p>
        <p><strong>Схід сонця:</strong> <span id="popup-sunrise"></span></p>
        <p><strong>Захід сонця:</strong> <span id="popup-sunset"></span></p>
        <p><strong>Фаза місяця:</strong> <span id="popup-moonphase"></span></p>
        <p><strong>Умови:</strong> <span id="popup-conditions"></span></p>
        <p><strong>Опис:</strong> <span id="popup-description"></span></p>
    </div>
`;
document.body.appendChild(popup);

const closeButton = popup.querySelector('.close-button');
closeButton.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Обробник кліку на температуру для відкриття попапу
temperatureElement.addEventListener('click', () => {
    if (!currentWeatherData || !currentWeatherData.days || currentWeatherData.days.length === 0) return;

    // Отримуємо дані для поточного відображеного дня (активний день)
    const activeDayIndex = Array.from(document.querySelectorAll('.forecast-day')).findIndex(day => day.classList.contains('active-day'));
    const dayData = currentWeatherData.days[activeDayIndex !== -1 ? activeDayIndex : 0]; // Беремо активний день або перший

    if (dayData) {
        document.getElementById('popup-date').textContent = new Date(dayData.datetime).toLocaleDateString('uk-UA');
        document.getElementById('popup-temp').textContent = `${Math.round(dayData.temp)}°C (Max: ${Math.round(dayData.tempmax)}°C, Min: ${Math.round(dayData.tempmin)}°C)`;
        document.getElementById('popup-feelslike').textContent = dayData.feelslike ? `${Math.round(dayData.feelslike)}°C` : 'N/A';
        document.getElementById('popup-precip').textContent = dayData.precip ? `${dayData.precip} mm` : '0 mm';
        document.getElementById('popup-humidity').textContent = `${Math.round(dayData.humidity)}%`;
        document.getElementById('popup-pressure').textContent = dayData.pressure ? `${dayData.pressure} hPa` : 'N/A';
        document.getElementById('popup-windspeed').textContent = `${Math.round(dayData.windspeed)} km/h`;
        document.getElementById('popup-windgust').textContent = dayData.windgust ? `${Math.round(dayData.windgust)} km/h` : 'N/A';
        document.getElementById('popup-winddir').textContent = dayData.winddir ? `${dayData.winddir}°` : 'N/A';
        document.getElementById('popup-visibility').textContent = dayData.visibility ? `${dayData.visibility} km` : 'N/A';
        document.getElementById('popup-uvindex').textContent = dayData.uvindex ? dayData.uvindex : 'N/A';
        document.getElementById('popup-sunrise').textContent = dayData.sunrise ? dayData.sunrise.substring(0, 5) : 'N/A'; // Тільки години та хвилини
        document.getElementById('popup-sunset').textContent = dayData.sunset ? dayData.sunset.substring(0, 5) : 'N/A';
        document.getElementById('popup-moonphase').textContent = dayData.moonphase ? dayData.moonphase : 'N/A';
        document.getElementById('popup-conditions').textContent = dayData.conditions;
        document.getElementById('popup-description').textContent = dayData.description || 'Немає додаткового опису.';

        popup.style.display = 'flex'; // Показуємо попап
    }
});


// Початкове завантаження погоди для Києва
async function init() {
    const initialLocation = "Kyiv";
    const data = await getWeatherData(initialLocation);
    updateWeatherUI(data);
}

init();
