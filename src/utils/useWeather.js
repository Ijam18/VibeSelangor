import { useState, useEffect } from 'react';

// Coordinates for Shah Alam, Selangor (approximate center)
const SELANGOR_LAT = 3.0738;
const SELANGOR_LON = 101.5183;

export function useWeather() {
    const [weather, setWeather] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchWeather() {
            try {
                // Open-Meteo API for current temperature and weathercode
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${SELANGOR_LAT}&longitude=${SELANGOR_LON}&current_weather=true&timezone=auto`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Weather API error: ${response.status}`);
                }
                const data = await response.json();

                if (isMounted) {
                    if (data && data.current_weather) {
                        setWeather({
                            temperature: data.current_weather.temperature,
                            weathercode: data.current_weather.weathercode,
                            // WMO Weather interpretation codes (WW)
                            // https://open-meteo.com/en/docs
                            description: getWeatherDescription(data.current_weather.weathercode)
                        });
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to fetch weather:", err);
                    setWeatherError(err.message);
                    setIsLoading(false);
                }
            }
        }

        fetchWeather();

        // Refresh weather every 30 minutes
        const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return { weather, weatherError, isLoading };
}

function getWeatherDescription(code) {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2 || code === 3) return 'Mainly clear, partly cloudy, and overcast';
    if (code === 45 || code === 48) return 'Fog and depositing rime fog';
    if (code === 51 || code === 53 || code === 55) return 'Drizzle: Light, moderate, and dense intensity';
    if (code === 56 || code === 57) return 'Freezing Drizzle: Light and dense intensity';
    if (code === 61 || code === 63 || code === 65) return 'Rain: Slight, moderate and heavy intensity';
    if (code === 66 || code === 67) return 'Freezing Rain: Light and heavy intensity';
    if (code === 71 || code === 73 || code === 75) return 'Snow fall: Slight, moderate, and heavy intensity';
    if (code === 77) return 'Snow grains';
    if (code === 80 || code === 81 || code === 82) return 'Rain showers: Slight, moderate, and violent';
    if (code === 85 || code === 86) return 'Snow showers slight and heavy';
    if (code === 95) return 'Thunderstorm: Slight or moderate';
    if (code === 96 || code === 99) return 'Thunderstorm with slight and heavy hail';
    return 'Unknown';
}
