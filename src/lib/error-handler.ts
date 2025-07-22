import { NextResponse } from 'next/server'
import { APIResponse } from './api-response'
import { Prisma } from '@prisma/client'

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return APIResponse.badRequest('Unique constraint violation', { field: error.meta?.target })
      case 'P2025':
        return APIResponse.notFound('Record not found')
      case 'P2003':
        return APIResponse.badRequest('Foreign key constraint violation')
      default:
        return APIResponse.serverError('Database error', { code: error.code })
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return APIResponse.badRequest('Invalid data provided')
  }

  // Handle other known errors
  if (error instanceof Error) {
    // AI service errors
    if (error.message.includes('rate limit')) {
      return APIResponse.error('AI service rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }
    
    if (error.message.includes('GEMINI_API_KEY')) {
      return APIResponse.serverError('AI service not configured properly')
    }

    // Weather service errors
    if (error.message.includes('weather') || error.message.includes('OPENWEATHERMAP')) {
      return APIResponse.error('Weather service unavailable', 503, 'WEATHER_SERVICE_ERROR')
    }

    // Generic error with message
    return APIResponse.serverError(error.message)
  }

  // Unknown error
  return APIResponse.serverError('An unexpected error occurred')
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}