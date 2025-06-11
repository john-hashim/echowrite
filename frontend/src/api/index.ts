// src/api/index.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// Get API base URL from environment variables with fallback
const BASE_URL = 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `token ${token}`
    }
    return config
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    if (error.response?.status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/auth/login')
      if (!isLoginEndpoint) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
