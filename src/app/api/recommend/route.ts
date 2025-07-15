import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData, formatWeatherString } from '@/lib/weather';
import { getStyleRecommendation } from '@/lib/gemini';
import { RecommendRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    
    // Get weather data
    const weatherData = await getWeatherData(body.context.location);
    const weatherString = formatWeatherString(weatherData);
    
    // Add weather to context
    const requestWithWeather: RecommendRequest = {
      ...body,
      context: {
        ...body.context,
        weather: weatherString
      }
    };
    
    // Get AI recommendation
    const recommendation = await getStyleRecommendation(requestWithWeather);
    
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendation' },
      { status: 500 }
    );
  }
}