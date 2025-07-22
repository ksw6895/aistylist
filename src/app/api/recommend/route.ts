import { NextRequest } from 'next/server';
import { getWeatherData, formatWeatherString } from '@/lib/weather';
import { getStyleRecommendation } from '@/lib/gemini';
import { RecommendRequest } from '@/types';
import { APIResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { z } from 'zod';

// Input validation schema
const recommendRequestSchema = z.object({
  userInfo: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
    occupation: z.string().optional(),
  }),
  context: z.object({
    date: z.string(),
    location: z.string().min(1),
    weather: z.string().optional(),
  }),
  request: z.object({
    item: z.string(),
    tpo: z.string(),
    mood: z.string(),
  }),
  previousRecommendations: z.array(z.any()).optional(),
  considering: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = recommendRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return APIResponse.badRequest('Invalid request data', validationResult.error.issues);
    }
    
    const validatedData = validationResult.data;
    
    // Get weather data
    const weatherData = await getWeatherData(validatedData.context.location);
    const weatherString = formatWeatherString(weatherData);
    
    // Add weather to context
    const requestWithWeather: RecommendRequest = {
      ...validatedData,
      context: {
        ...validatedData.context,
        weather: weatherString
      }
    };
    
    // Get AI recommendation
    const recommendation = await getStyleRecommendation(requestWithWeather);
    
    // Return recommendation with weather info
    return APIResponse.success({
      ...recommendation,
      weather: weatherString
    }, 'Recommendation generated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}