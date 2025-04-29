// src/api/services/auth.ts
import { AxiosResponse } from 'axios'
import apiClient from '../index'
import { ENDPOINTS } from '../endpoints'

// Auth interfaces
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  // Add other registration fields as needed
}

export interface UserResponse {
  id: string
  email: string
  name?: string
  // Add other user fields as needed
}

export interface AuthResponse {
  user: UserResponse
  token: string
}

export const authService = {
  /**
   * Login user with email and password
   * @param credentials - User credentials
   * @returns Promise with user data and token
   */
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials)
  },

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with user data and token
   */
  register: (userData: RegisterData): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData)
  },

  /**
   * Logout current user
   * @returns Promise with logout response
   */
  logout: (): Promise<AxiosResponse<{ success: boolean }>> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  getMe: (): Promise<AxiosResponse<UserResponse>> => {
    return apiClient.get(ENDPOINTS.AUTH.GET_ME)
  },
}
