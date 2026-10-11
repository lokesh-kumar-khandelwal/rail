import { WeatherInfo } from '../types';

export const CACHED_WEATHER: WeatherInfo = {
  temp: 32,
  condition: 'Clear, 32°C',
  location: 'Kota Jn Section',
  isLive: false,
};

// Weather WMO Code mapping to short descriptions
function mapWmoCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Light Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

export async function fetchLiveWeather(): Promise<WeatherInfo> {
  try {
    // Open-Meteo API for Kota Junction, Rajasthan (Lat: 25.2138, Lon: 75.8648)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=25.2138&longitude=75.8648&current=temperature_2m,weather_code',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Weather API response error');

    const data = await res.json();
    const current = data.current;
    if (!current) throw new Error('Missing current data');

    const temp = Math.round(current.temperature_2m);
    const cond = mapWmoCode(current.weather_code);

    return {
      temp,
      condition: `${cond}, ${temp}°C`,
      location: 'Kota Jn Section',
      isLive: true,
    };
  } catch {
    return { ...CACHED_WEATHER };
  }
}
