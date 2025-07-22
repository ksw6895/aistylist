import { formatWeatherString } from '@/lib/weather'
import { WeatherData } from '@/types'

describe('formatWeatherString', () => {
  it('should format weather data correctly', () => {
    const weatherData: WeatherData = {
      temp: 20,
      description: '맑음',
      main: 'Clear'
    }
    
    const result = formatWeatherString(weatherData)
    expect(result).toBe('맑음, 기온 20°C')
  })

  it('should handle null weather data', () => {
    const result = formatWeatherString(null)
    expect(result).toBe('날씨 정보를 가져올 수 없습니다')
  })

  it('should format decimal temperature correctly', () => {
    const weatherData: WeatherData = {
      temp: 15.7,
      description: '흐림',
      main: 'Cloudy'
    }
    
    const result = formatWeatherString(weatherData)
    expect(result).toBe('흐림, 기온 15.7°C')
  })
})