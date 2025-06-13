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
}

export interface ResetPasswordInterface {
  email: string
  newPassword: string
  otp: string
}

export interface verificationResponce {
  message: string
  user: UserResponse
  token: string
  verified: boolean
}
export interface AuthResponse {
  user: UserResponse
  message: string
  emailSent?: boolean
  emailVerified?: boolean
  action?: 'verify-email' | 'login' // Tells frontend what to do next
  token: string
}

export interface verifyOtpParams {
  email: string
  otp: string
}

export interface EmailVerificationSendApiResponce {
  success: boolean
  message: string
  emailVerified?: boolean
}

export interface BasicResponce {
  message: string
  success: boolean
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
   * @returns Promise with user data
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
   * Send Email Verification OTP
   * @returns Promise with email verification status and users email id
   */
  sendVerificationEmail: (
    email: string
  ): Promise<AxiosResponse<EmailVerificationSendApiResponce>> => {
    return apiClient.post(ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL, { email })
  },

  /**
   * Verify Email OTP
   * @returns Promise with user data and verification status and token
   */
  verifyEmail: (data: verifyOtpParams): Promise<AxiosResponse<verificationResponce>> => {
    return apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, data)
  },

  /**
   * Send Otp for reset password
   * @returns Promise with success status
   */
  requestPasswordReset: (email: string): Promise<AxiosResponse<BasicResponce>> => {
    return apiClient.post(ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email })
  },
  /**
   * Send Otp for reset password
   * @returns Promise with success status
   */
  resetPassword: (data: ResetPasswordInterface): Promise<AxiosResponse<BasicResponce>> => {
    return apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data)
  },
  /**
   * Get current user profile
   * @returns Promise with user data
   */
  getMe: (): Promise<AxiosResponse<UserResponse>> => {
    return apiClient.get(ENDPOINTS.AUTH.GET_ME)
  },
}
