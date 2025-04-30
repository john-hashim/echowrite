// src/hooks/useApi.ts
import { useState, useCallback } from 'react'
import { AxiosResponse, AxiosError } from 'axios'

type ApiFunction<T, P extends any[]> = (...args: P) => Promise<AxiosResponse<T>>

interface UseApiReturn<T, P extends any[]> {
  data: T | null
  error: string | null
  loading: boolean
  execute: (...args: P) => Promise<T>
  reset: () => void
}

/**
 * Custom hook for making API calls
 * @param apiFunc - API function to call
 * @returns Object with data, error, loading state, execute function, and reset function
 */
export function useApi<T, P extends any[]>(apiFunc: ApiFunction<T, P>): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Reset state function
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  const execute = useCallback(
    async (...args: P): Promise<T> => {
      try {
        setLoading(true)
        // setError(null)
        const response = await apiFunc(...args)
        setData(response.data)
        return response.data
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string; error?: string }>

        // Extract error message from different possible response formats
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Something went wrong'

        setError(errorMessage)

        // Still need to throw the error for the component to catch it
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunc]
  )

  return {
    data,
    error,
    loading,
    execute,
    reset,
  }
}
