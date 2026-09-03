// ============================================================
// AgriOS — Open-Meteo Weather Service (no API key required)
// ============================================================
import { WeatherData, WeatherCondition, WeatherForecastDay, WeatherRisk } from '@/types';
import { DEMO_WEATHER } from '@/lib/demo/demoData';

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const weatherCache = new Map<string, { data: WeatherData; ts: number }>();

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm, heavy hail',
};

function calcRisks(current: WeatherCondition, forecast: WeatherForecastDay[]): WeatherRisk {
  const next7Rain = forecast.slice(0, 7).reduce((s, d) => s + d.precipitation, 0);
  const maxTemp = Math.max(...forecast.slice(0, 3).map(d => d.maxTemp));
  const avgHumidity = forecast.slice(0, 3).reduce((s, d) => s + d.humidity, 0) / 3;
  const rainProb = Math.max(...forecast.slice(0, 3).map(d => d.precipitationProbability));

  return {
    irrigationStress: next7Rain < 5 && current.humidity < 50 ? 'high' : next7Rain < 10 ? 'moderate' : 'low',
    heatStress: maxTemp > 38 ? 'critical' : maxTemp > 35 ? 'high' : maxTemp > 32 ? 'moderate' : 'low',
    diseaseRisk: avgHumidity > 75 && current.temperature > 20 ? 'high' : avgHumidity > 65 ? 'moderate' : 'low',
    droughtRisk: next7Rain < 3 && current.humidity < 40 ? 'high' : next7Rain < 8 ? 'moderate' : 'low',
    rainfallOpportunity: rainProb > 60,
    sprayConditions: current.windSpeed < 15 && current.humidity < 70 ? 'favorable' : current.windSpeed < 25 ? 'marginal' : 'unfavorable',
  };
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,relative_humidity_2m_max,weather_code');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '7');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const raw = await res.json();

    const current: WeatherCondition = {
      temperature: raw.current.temperature_2m,
      apparentTemperature: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      precipitation: raw.current.precipitation,
      windSpeed: raw.current.wind_speed_10m,
      weatherCode: raw.current.weather_code,
      description: WMO_DESCRIPTIONS[raw.current.weather_code] || 'Unknown',
    };

    const forecast: WeatherForecastDay[] = raw.daily.time.map((date: string, i: number) => ({
      date,
      maxTemp: raw.daily.temperature_2m_max[i],
      minTemp: raw.daily.temperature_2m_min[i],
      precipitation: raw.daily.precipitation_sum[i] ?? 0,
      precipitationProbability: raw.daily.precipitation_probability_max[i] ?? 0,
      humidity: raw.daily.relative_humidity_2m_max[i] ?? 0,
      weatherCode: raw.daily.weather_code[i],
      description: WMO_DESCRIPTIONS[raw.daily.weather_code[i]] || 'Unknown',
    }));

    const data: WeatherData = {
      current,
      forecast,
      risks: calcRisks(current, forecast),
      source: 'Open-Meteo',
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    };

    weatherCache.set(key, { data, ts: Date.now() });
    return data;
  } catch (err) {
    console.error('[Weather] fetchWeather failed, using demo fallback:', err);
    return { ...DEMO_WEATHER, isDemo: true };
  }
}
