import axios from 'axios';
import { ActionItem } from './intentRouter';

interface WeatherResult {
  reply: string;
  actions: ActionItem[];
}

export const weatherService = {
  async getWeather(city: string): Promise<WeatherResult> {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return {
        reply: `Apologies, Sir. The weather service is not configured. Please set OPENWEATHER_API_KEY.`,
        actions: [],
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data;

    const temp = Math.round(data.main.temp);
    const feels = Math.round(data.main.feels_like);
    const desc = data.weather[0].description;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6); // m/s to km/h
    const cityName = data.name;
    const country = data.sys.country;

    const reply = `Currently ${temp}°C in ${cityName}, ${country}, Sir. ${desc.charAt(0).toUpperCase() + desc.slice(1)}, feels like ${feels}°C. Humidity ${humidity}%, wind ${wind} km/h.`;

    return {
      reply,
      actions: [{
        type: 'WEATHER_RESULT',
        data: {
          city: cityName,
          country,
          temperature: temp,
          feelsLike: feels,
          description: desc,
          humidity,
          windSpeed: wind,
        },
      }],
    };
  },
};
