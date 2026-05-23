import { logger } from "./logger";
import type { WeatherPayload } from "./ootdUtils";

export async function fetchWeather(city: string): Promise<WeatherPayload> {
  const targetCity = city?.trim() || "New York";
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

    return {
      city: targetCity,
      temp: Math.round(rawWeather.main?.temp ?? fallback.temp),
      minTemp: Math.round(rawWeather.main?.temp_min ?? fallback.minTemp),
      maxTemp: Math.round(rawWeather.main?.temp_max ?? fallback.maxTemp),
      condition: rawWeather.weather?.[0]?.main || fallback.condition,
      precipitationRisk,
      description: rawWeather.weather?.[0]?.description || fallback.description,
      source: "openweathermap",
    };
  } catch (error) {
    logger.error("Error fetching live weather. Using fallback weather.", error);
    return fallback;
  }
}
