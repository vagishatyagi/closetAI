import { logger } from "./logger";
import type { WeatherPayload } from "./ootdUtils";

const WEATHER_CACHE = new Map<string, {
  payload: WeatherPayload;
  expiresAt: number;
}>();

const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache TTL

export async function fetchWeather(city: string): Promise<WeatherPayload> {
  const targetCity = city?.trim() || "New York";
  const normalizedKey = targetCity.toLowerCase();

  const fallback: WeatherPayload = {
    city: targetCity,
    temp: 72,
    minTemp: 64,
    maxTemp: 78,
    condition: "Partly Cloudy",
    precipitationRisk: 10,
    description: "pleasant conditions, ideal for flexible lightweight layers",
    source: "fallback",
  };

  // 1. Resolve from cache if within TTL (0ms latency hits)
  const cached = WEATHER_CACHE.get(normalizedKey);
  if (cached && cached.expiresAt > Date.now()) {
    logger.info("fetchWeather [CACHE HIT]", { city: targetCity });
    return cached.payload;
  }

  const weatherApiKey = process.env.WEATHER_API_KEY;
  if (!weatherApiKey || weatherApiKey === "your_openweather_api_key_here") {
    return fallback;
  }

  try {
    const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    weatherUrl.searchParams.set("q", targetCity);
    weatherUrl.searchParams.set("units", "imperial");
    weatherUrl.searchParams.set("appid", weatherApiKey);

    const weatherRes = await fetch(weatherUrl, { cache: "no-store" });
    if (!weatherRes.ok) {
      logger.warn(`Weather API returned ${weatherRes.status}. Using fallback weather.`);
      return fallback;
    }

    const rawWeather = await weatherRes.json();
    const rainAmount = Number(rawWeather.rain?.["1h"] || rawWeather.rain?.["3h"] || 0);
    const snowAmount = Number(rawWeather.snow?.["1h"] || rawWeather.snow?.["3h"] || 0);
    const weatherText = `${rawWeather.weather?.[0]?.main || ""} ${rawWeather.weather?.[0]?.description || ""}`;
    const precipitationRisk = rainAmount > 0 || snowAmount > 0 || /rain|storm|snow|drizzle/i.test(weatherText) ? 80 : 0;

    const result: WeatherPayload = {
      city: targetCity,
      temp: Math.round(rawWeather.main?.temp ?? fallback.temp),
      minTemp: Math.round(rawWeather.main?.temp_min ?? fallback.minTemp),
      maxTemp: Math.round(rawWeather.main?.temp_max ?? fallback.maxTemp),
      condition: rawWeather.weather?.[0]?.main || fallback.condition,
      precipitationRisk,
      description: rawWeather.weather?.[0]?.description || fallback.description,
      source: "openweathermap",
    };

    WEATHER_CACHE.set(normalizedKey, {
      payload: result,
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
    });

    return result;
  } catch (error) {
    logger.error("Error fetching live weather. Using fallback weather.", error);
    
    // Cache the fallback briefly so network failures don't hang subsequent loops
    WEATHER_CACHE.set(normalizedKey, {
      payload: fallback,
      expiresAt: Date.now() + 30 * 1000, // 30s for failures
    });
    
    return fallback;
  }
}
