import { renderHook, act } from '@testing-library/react'
import { useAsyncState } from '@/hooks/useAsyncState'

describe('useAsyncState', () => {
  it('should initialize with null data and no loading/error', () => {
    const { result } = renderHook(() => useAsyncState<string>())
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle successful async operation', async () => {
    const { result } = renderHook(() => useAsyncState<string>())
    const testData = 'test data'
    
    let executeResult: string | undefined
    
    await act(async () => {
      executeResult = await result.current.execute(async () => testData)
    })
    
    expect(executeResult).toBe(testData)
    expect(result.current.data).toBe(testData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle loading state during async operation', async () => {
    const { result } = renderHook(() => useAsyncState<string>())
    
    let resolvePromise: (value: string) => void
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve
    })
    
    act(() => {
      result.current.execute(() => promise)
    })
    
    // Check loading state
    expect(result.current.loading).toBe(true)
    
    await act(async () => {
      resolvePromise!('done')
      await promise
    })
    
    expect(result.current.loading).toBe(false)
  })

  it('should handle error in async operation', async () => {
    const { result } = renderHook(() => useAsyncState<string>())
    const testError = new Error('Test error')
    
    await act(async () => {
      try {
        await result.current.execute(async () => {
          throw testError
        })
      } catch (e) {
        // Expected error
      }
    })
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(testError)
  })

  it('should reset state when reset is called', async () => {
    const { result } = renderHook(() => useAsyncState<string>())
    
    // First, set some data
    await act(async () => {
      await result.current.execute(async () => 'test data')
    })
    
    expect(result.current.data).toBe('test data')
    
    // Reset
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})