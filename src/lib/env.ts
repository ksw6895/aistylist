import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  OPENWEATHERMAP_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
})

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>

class EnvValidator {
  private validated: Env | null = null

  get(): Env {
    if (!this.validated) {
      // Use raw process.env during build time
      if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
        // Return dummy values during build
        return {
          DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy',
          GEMINI_API_KEY: 'dummy-key',
          OPENWEATHERMAP_API_KEY: 'dummy-key',
          NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test' | undefined,
        }
      }

      const parsed = envSchema.safeParse(process.env)
      
      if (!parsed.success) {
        console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.issues, null, 2))
        throw new Error('Invalid environment variables')
      }
      
      this.validated = parsed.data
    }
    
    return this.validated
  }
}

const envValidator = new EnvValidator()

// Export a getter that validates on first access
export const env = new Proxy({} as Env, {
  get(_, prop: keyof Env) {
    return envValidator.get()[prop]
  }
})