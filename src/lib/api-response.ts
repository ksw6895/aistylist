import { NextResponse } from 'next/server'

export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

export class APIResponse {
  static success<T>(data: T, message?: string): NextResponse<SuccessResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
    })
  }
  
  static error(message: string, status = 400, code?: string, details?: any): NextResponse<ErrorResponse> {
    return NextResponse.json({
      success: false,
      error: message,
      code,
      details,
    }, { status })
  }
  
  static unauthorized(message = 'Unauthorized'): NextResponse<ErrorResponse> {
    return this.error(message, 401, 'UNAUTHORIZED')
  }
  
  static forbidden(message = 'Forbidden'): NextResponse<ErrorResponse> {
    return this.error(message, 403, 'FORBIDDEN')
  }
  
  static notFound(message = 'Not found'): NextResponse<ErrorResponse> {
    return this.error(message, 404, 'NOT_FOUND')
  }
  
  static badRequest(message = 'Bad request', details?: any): NextResponse<ErrorResponse> {
    return this.error(message, 400, 'BAD_REQUEST', details)
  }
  
  static serverError(message = 'Internal server error', details?: any): NextResponse<ErrorResponse> {
    return this.error(message, 500, 'SERVER_ERROR', details)
  }
}