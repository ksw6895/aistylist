import { useState, useCallback } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsyncState<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const execute = useCallback(async (fn: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])
  
  return { data, loading, error, execute, reset }
}