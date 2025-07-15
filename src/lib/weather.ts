import axios from 'axios';
import { WeatherData } from '@/types';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityNameMapping: { [key: string]: string } = {
  '서울': 'Seoul',
  '부산': 'Busan',
  '대구': 'Daegu',
  '인천': 'Incheon',
  '광주': 'Gwangju',
  '대전': 'Daejeon',
  '울산': 'Ulsan',
  '수원': 'Suwon',
  '창원': 'Changwon',
  '고양': 'Goyang',
  '용인': 'Yongin',
  '청주': 'Cheongju',
  '안산': 'Ansan',
  '전주': 'Jeonju',
  '천안': 'Cheonan',
  '남양주': 'Namyangju',
  '화성': 'Hwaseong',
  '부천': 'Bucheon',
  '포항': 'Pohang',
  '평택': 'Pyeongtaek',
  '제주': 'Jeju',
  '시흥': 'Siheung',
  '파주': 'Paju',
  '김해': 'Gimhae',
  '의정부': 'Uijeongbu',
  '김포': 'Gimpo',
  '양산': 'Yangsan',
  '구리': 'Guri',
  '양주': 'Yangju',
  '안양': 'Anyang',
};

export async function getWeatherData(location: string): Promise<WeatherData | null> {
  if (!WEATHER_API_KEY) {
    console.warn('Weather API key not configured');
    return null;
  }

  try {
    const cityName = cityNameMapping[location] || location;
    
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: cityName,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'kr'
      }
    });

    return {
      temp: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      main: response.data.weather[0].main
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

export function formatWeatherString(weather: WeatherData | null): string {
  if (!weather) {
    return '날씨 정보를 가져올 수 없습니다';
  }
  
  return `${weather.description}, 기온 ${weather.temp}°C`;
}