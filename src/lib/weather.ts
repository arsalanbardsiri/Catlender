export interface DailyForecast {
    date: string;
    weatherCode: number;
    maxTemp: number;
    minTemp: number;
}

export interface WeatherData {
    current: {
        temperature: number;
        weatherCode: number;
        description: string;
        isDay: boolean;
        windSpeed: number;
        humidity: number;
    };
    daily: DailyForecast[];
}

// WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
export const getWeatherDescription = (code: number): string => {
    switch (code) {
        case 0: return "Clear sky";
        case 1: return "Mainly clear";
        case 2: return "Partly cloudy";
        case 3: return "Overcast";
        case 45: case 48: return "Foggy";
        case 51: case 53: case 55: return "Drizzle";
        case 61: case 63: case 65: return "Rain";
        case 71: case 73: case 75: return "Snow";
        case 80: case 81: case 82: return "Rain showers";
        case 95: case 96: case 99: return "Thunderstorm";
        default: return "Unknown";
    }
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=6`
        );
        const data = await res.json();

        const daily: DailyForecast[] = data.daily.time.map((time: string, index: number) => ({
            date: time,
            weatherCode: data.daily.weather_code[index],
            maxTemp: data.daily.temperature_2m_max[index],
            minTemp: data.daily.temperature_2m_min[index],
        }));

        return {
            current: {
                temperature: data.current.temperature_2m,
                weatherCode: data.current.weather_code,
                description: getWeatherDescription(data.current.weather_code),
                isDay: data.current.is_day === 1,
                windSpeed: data.current.wind_speed_10m,
                humidity: data.current.relative_humidity_2m
            },
            daily
        };
    } catch (error) {
        console.error("Failed to fetch weather", error);
        throw error;
    }
}

export async function searchCity(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
    try {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
        );
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            return null;
        }

        return {
            lat: data.results[0].latitude,
            lon: data.results[0].longitude,
            name: data.results[0].name,
        };
    } catch (error) {
        console.error("Failed to search city", error);
        return null;
    }
}
