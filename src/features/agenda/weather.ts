import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeatherData = {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  fetchedAt: number;
  locationLabel: string;
  latitude: number;
  longitude: number;
};

const CACHE_KEY = 'weather-cache-v1';
const LOCATION_KEY = 'weather-location-v1';
const CACHE_TTL_MS = 30 * 60 * 1000;

const weatherCodeMap: Record<number, string> = {
  0: 'Ensolarado',
  1: 'Poucas nuvens',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina',
  51: 'Garoa',
  53: 'Garoa',
  55: 'Garoa',
  61: 'Chuva',
  63: 'Chuva',
  65: 'Chuva',
  71: 'Neve',
  73: 'Neve',
  75: 'Neve',
  80: 'Chuva',
  81: 'Chuva',
  82: 'Chuva forte',
  95: 'Tempestade',
  96: 'Tempestade',
  99: 'Tempestade',
};

export type WeatherInsights = {
  title: string;
  lines: string[];
};

export const buildInsights = (data: WeatherData): WeatherInsights => {
  const lines: string[] = [];
  if (data.temperature >= 30) {
    lines.push('Dia quente: ofereça água fresca e pausas na sombra.');
  } else if (data.temperature <= 12) {
    lines.push('Clima frio: passeios mais curtos e proteção extra ajudam.');
  } else {
    lines.push('Temperatura amena: ótimo para atividades ao ar livre.');
  }

  if (data.condition.toLowerCase().includes('chuva') || data.condition.toLowerCase().includes('tempestade')) {
    lines.push('Leve capa/guarda-chuva e evite áreas escorregadias.');
  } else if (data.condition.toLowerCase().includes('nublado')) {
    lines.push('Boa visibilidade para passeios mais longos.');
  } else if (data.condition.toLowerCase().includes('neblina')) {
    lines.push('Atenção redobrada em ambientes externos.');
  }

  return {
    title: data.condition,
    lines: lines.slice(0, 2),
  };
};

export const loadCachedWeather = async (): Promise<WeatherData | null> => {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WeatherData;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveCachedWeather = async (data: WeatherData) => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
};

export const saveLocationPreference = async (
  latitude: number,
  longitude: number,
  label: string,
) => {
  await AsyncStorage.setItem(
    LOCATION_KEY,
    JSON.stringify({ latitude, longitude, label }),
  );
};

export const loadLocationPreference = async (): Promise<
  | { latitude: number; longitude: number; label: string }
  | null
> => {
  const raw = await AsyncStorage.getItem(LOCATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { latitude: number; longitude: number; label: string };
  } catch {
    return null;
  }
};

export const fetchWeather = async (
  latitude: number,
  longitude: number,
  locationLabel: string,
): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Weather request failed');
  }
  const data = (await response.json()) as {
    current_weather?: {
      temperature: number;
      windspeed: number;
      weathercode: number;
    };
  };

  const current = data.current_weather;
  if (!current) throw new Error('Weather data missing');

  const condition = weatherCodeMap[current.weathercode] ?? 'Clima';

  const payload: WeatherData = {
    temperature: current.temperature,
    windSpeed: current.windspeed,
    weatherCode: current.weathercode,
    condition,
    fetchedAt: Date.now(),
    locationLabel,
    latitude,
    longitude,
  };

  await saveCachedWeather(payload);
  return payload;
};

export const geocodeLocation = async (query: string) => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=1&language=pt&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Geocoding failed');
  const data = (await response.json()) as {
    results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
  };

  const result = data.results?.[0];
  if (!result) return null;
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    label: result.country ? `${result.name}, ${result.country}` : result.name,
  };
};
