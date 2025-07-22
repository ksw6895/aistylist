import { APIResponse } from '@/lib/api-response'

describe('APIResponse', () => {
  describe('success', () => {
    it('should return a success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = APIResponse.success(data)
      
      const body = JSON.parse(response.body)
      expect(response.status).toBe(200)
      expect(body).toEqual({
        success: true,
        data,
      })
    })

    it('should include message when provided', () => {
      const data = { id: 1 }
      const message = 'Operation successful'
      const response = APIResponse.success(data, message)
      
      const body = JSON.parse(response.body)
      expect(body.message).toBe(message)
    })
  })

  describe('error', () => {
    it('should return an error response with default status', () => {
      const message = 'Something went wrong'
      const response = APIResponse.error(message)
      
      const body = JSON.parse(response.body)
      expect(response.status).toBe(400)
      expect(body).toEqual({
        success: false,
        error: message,
      })
    })

    it('should return an error response with custom status and code', () => {
      const message = 'Not found'
      const status = 404
      const code = 'NOT_FOUND'
      const response = APIResponse.error(message, status, code)
      
      const body = JSON.parse(response.body)
      expect(response.status).toBe(status)
      expect(body.code).toBe(code)
    })
  })

  describe('specific error methods', () => {
    it('should return unauthorized response', () => {
      const response = APIResponse.unauthorized()
      expect(response.status).toBe(401)
      
      const body = JSON.parse(response.body)
      expect(body.code).toBe('UNAUTHORIZED')
    })

    it('should return not found response', () => {
      const response = APIResponse.notFound('User not found')
      expect(response.status).toBe(404)
      
      const body = JSON.parse(response.body)
      expect(body.error).toBe('User not found')
      expect(body.code).toBe('NOT_FOUND')
    })

    it('should return server error response', () => {
      const response = APIResponse.serverError()
      expect(response.status).toBe(500)
      
      const body = JSON.parse(response.body)
      expect(body.code).toBe('SERVER_ERROR')
    })
  })
})