import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  OPENWEATHERMAP_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
})

// Parse and validate environment variables
function validateEnv() {
  const parsed = envSchema.safeParse(process.env)
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.issues, null, 2))
    throw new Error('Invalid environment variables')
  }
  
  return parsed.data
}

// Export validated environment variables
export const env = validateEnv()

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>