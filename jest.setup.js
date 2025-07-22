// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env = {
  ...process.env,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  GEMINI_API_KEY: 'test-gemini-key',
  OPENWEATHERMAP_API_KEY: 'test-weather-key',
}

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, init) => {
      const response = {
        body: JSON.stringify(body),
        status: init?.status || 200,
        headers: init?.headers || {},
      }
      return response
    }
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))