import axios from 'axios';

interface WeatherData {
  condition: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  rain: boolean;
  description: string;
}

interface LocationCoordinates {
  lat: number;
  lon: number;
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  // Major football city coordinates
  private cityCoordinates: { [key: string]: LocationCoordinates } = {
    // England
    'London': { lat: 51.5074, lon: -0.1278 },
    'Manchester': { lat: 53.4808, lon: -2.2426 },
    'Liverpool': { lat: 53.4084, lon: -2.9916 },
    'Birmingham': { lat: 52.4862, lon: -1.8904 },
    'Newcastle': { lat: 54.9783, lon: -1.6178 },
    'Leeds': { lat: 53.8008, lon: -1.5491 },
    'Sheffield': { lat: 53.3811, lon: -1.4701 },
    'Brighton': { lat: 50.8225, lon: -0.1372 },
    'Southampton': { lat: 50.9097, lon: -1.4044 },
    'Leicester': { lat: 52.6369, lon: -1.1398 },
    'Nottingham': { lat: 52.9548, lon: -1.1581 },
    'Wolverhampton': { lat: 52.5862, lon: -2.1283 },
    
    // Spain
    'Madrid': { lat: 40.4168, lon: -3.7038 },
    'Barcelona': { lat: 41.3851, lon: 2.1734 },
    'Seville': { lat: 37.3891, lon: -5.9845 },
    'Valencia': { lat: 39.4699, lon: -0.3763 },
    'Bilbao': { lat: 43.2630, lon: -2.9350 },
    'San Sebastian': { lat: 43.3183, lon: -1.9812 },
    
    // Italy
    'Rome': { lat: 41.9028, lon: 12.4964 },
    'Milan': { lat: 45.4642, lon: 9.1900 },
    'Turin': { lat: 45.0703, lon: 7.6869 },
    'Naples': { lat: 40.8518, lon: 14.2681 },
    'Florence': { lat: 43.7696, lon: 11.2558 },
    'Bergamo': { lat: 45.6983, lon: 9.6773 },
    
    // Germany
    'Berlin': { lat: 52.5200, lon: 13.4050 },
    'Munich': { lat: 48.1351, lon: 11.5820 },
    'Dortmund': { lat: 51.5136, lon: 7.4653 },
    'Hamburg': { lat: 53.5511, lon: 9.9937 },
    'Frankfurt': { lat: 50.1109, lon: 8.6821 },
    'Stuttgart': { lat: 48.7758, lon: 9.1829 },
    'Cologne': { lat: 50.9375, lon: 6.9603 },
    
    // France
    'Paris': { lat: 48.8566, lon: 2.3522 },
    'Marseille': { lat: 43.2965, lon: 5.3698 },
    'Lyon': { lat: 45.7640, lon: 4.8357 },
    'Lille': { lat: 50.6292, lon: 3.0573 },
    'Nice': { lat: 43.7102, lon: 7.2620 },
    'Bordeaux': { lat: 44.8378, lon: -0.5792 },
    
    // Portugal
    'Lisbon': { lat: 38.7223, lon: -9.1393 },
    'Porto': { lat: 41.1579, lon: -8.6291 },
    
    // Netherlands
    'Amsterdam': { lat: 52.3676, lon: 4.9041 },
    'Rotterdam': { lat: 51.9244, lon: 4.4777 },
    'Eindhoven': { lat: 51.4416, lon: 5.4697 },
  };

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ OPENWEATHER_API_KEY not set - weather data will be unavailable');
    }
  }

  /**
   * Get weather forecast for a specific match
   */
  async getMatchWeather(city: string, matchDate: Date): Promise<WeatherData | null> {
    if (!this.apiKey) {
      console.log('Weather API key not configured');
      return null;
    }

    try {
      const coords = this.getCityCoordinates(city);
      if (!coords) {
        console.log(`No coordinates found for city: ${city}`);
        return null;
      }

      // Check if match is within 5 days (forecast limit)
      const now = new Date();
      const hoursDiff = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 0 || hoursDiff > 120) {
        // Match is in the past or too far in future
        return null;
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      // Find the forecast closest to match time
      const forecast = this.findClosestForecast(response.data.list, matchDate);
      
      if (!forecast) return null;

      return this.parseWeatherData(forecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Get current weather for a city
   */
  async getCurrentWeather(city: string): Promise<WeatherData | null> {
    if (!this.apiKey) return null;

    try {
      const coords = this.getCityCoordinates(city);
      if (!coords) return null;

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.parseWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  /**
   * Get city coordinates from name
   */
  private getCityCoordinates(city: string): LocationCoordinates | null {
    // Try exact match first
    if (this.cityCoordinates[city]) {
      return this.cityCoordinates[city];
    }

    // Try case-insensitive match
    const cityLower = city.toLowerCase();
    const matchedCity = Object.keys(this.cityCoordinates).find(
      key => key.toLowerCase() === cityLower
    );

    if (matchedCity) {
      return this.cityCoordinates[matchedCity];
    }

    // Try partial match (e.g., "Manchester United" -> "Manchester")
    const partialMatch = Object.keys(this.cityCoordinates).find(
      key => cityLower.includes(key.toLowerCase()) || key.toLowerCase().includes(cityLower)
    );

    return partialMatch ? this.cityCoordinates[partialMatch] : null;
  }

  /**
   * Find forecast closest to match time
   */
  private findClosestForecast(forecasts: any[], matchDate: Date): any {
    let closest = forecasts[0];
    let minDiff = Math.abs(new Date(forecasts[0].dt * 1000).getTime() - matchDate.getTime());

    for (const forecast of forecasts) {
      const forecastDate = new Date(forecast.dt * 1000);
      const diff = Math.abs(forecastDate.getTime() - matchDate.getTime());
      
      if (diff < minDiff) {
        minDiff = diff;
        closest = forecast;
      }
    }

    return closest;
  }

  /**
   * Parse weather API response into our format
   */
  private parseWeatherData(data: any): WeatherData {
    const main = data.main;
    const weather = data.weather[0];
    const wind = data.wind;
    const rain = data.rain || {};

    return {
      condition: weather.main,
      temp: Math.round(main.temp),
      feelsLike: Math.round(main.feels_like),
      humidity: main.humidity,
      windSpeed: Math.round(wind.speed * 3.6), // Convert m/s to km/h
      windDirection: this.getWindDirection(wind.deg),
      precipitation: rain['1h'] || rain['3h'] || 0,
      rain: weather.main === 'Rain' || weather.main === 'Drizzle' || weather.main === 'Thunderstorm',
      description: weather.description
    };
  }

  /**
   * Convert wind degrees to direction
   */
  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  /**
   * Get weather impact summary for betting analysis
   */
  getWeatherImpact(weather: WeatherData): string {
    const impacts: string[] = [];

    // Temperature impact
    if (weather.temp < 5) {
      impacts.push('freezing conditions');
    } else if (weather.temp > 30) {
      impacts.push('scorching heat');
    }

    // Rain impact
    if (weather.rain) {
      if (weather.precipitation > 5) {
        impacts.push('heavy rain expected');
      } else {
        impacts.push('light rain');
      }
    }

    // Wind impact
    if (weather.windSpeed > 40) {
      impacts.push('strong winds');
    } else if (weather.windSpeed > 25) {
      impacts.push('breezy conditions');
    }

    if (impacts.length === 0) {
      return 'ideal playing conditions';
    }

    return impacts.join(', ');
  }

  /**
   * Check if weather significantly affects play
   */
  isSignificantWeather(weather: WeatherData): boolean {
    return (
      weather.temp < 5 ||
      weather.temp > 30 ||
      weather.windSpeed > 25 ||
      (weather.rain && weather.precipitation > 2)
    );
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };
