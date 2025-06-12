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

export function useApi<T, P extends any[]>(apiFunc: ApiFunction<T, P>): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  const execute = useCallback(
    async (...args: P): Promise<T> => {
      try {
        setLoading(true)
        const response = await apiFunc(...args)
        setData(response.data)
        return response.data
      } catch (err) {
        const axiosError = err as AxiosError<any>

        // Set the error response data to data field so we can access it
        if (axiosError.response?.data) {
          setData(axiosError.response.data)
        }

        // Extract error message for the error field
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Something went wrong'

        setError(errorMessage)
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
