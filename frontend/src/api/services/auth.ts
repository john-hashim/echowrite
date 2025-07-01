// src/api/services/auth.ts
import { AxiosResponse } from 'axios'
import apiClient from '../index'
import { ENDPOINTS } from '../endpoints'
import {
  AuthResponse,
  BasicResponce,
  EmailVerificationSendApiResponce,
  GoogleAccountResponse,
  GoogleAuthResponse,
  GoogleSignInRequest,
  LinkGoogleAccountRequest,
  LoginCredentials,
  RegisterData,
  ResetPasswordInterface,
  UserResponse,
  verificationResponce,
  verifyOtpParams,
} from '@/types/auth'

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
   * Reset password with OTP
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

  // Google Auth methods

  /**
   * Get Google OAuth URL for authentication
   * @returns Promise with Google auth URL
   */
  googleAuth: (): Promise<AxiosResponse<GoogleAuthResponse>> => {
    return apiClient.get(ENDPOINTS.AUTH.GOOGLE.AUTH)
  },

  /**
   * Sign in with Google using authorization code (API approach)
   * @param data - Google authorization code
   * @returns Promise with user data and token
   */
  googleSignIn: (data: GoogleSignInRequest): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post(ENDPOINTS.AUTH.GOOGLE.SIGNIN, data)
  },

  /**
   * Link Google account to existing user
   * @param data - Google authorization code
   * @returns Promise with updated user data
   */
  linkGoogleAccount: (
    data: LinkGoogleAccountRequest
  ): Promise<AxiosResponse<GoogleAccountResponse>> => {
    return apiClient.post(ENDPOINTS.AUTH.GOOGLE.LINK, data)
  },

  /**
   * Unlink Google account from user
   * @returns Promise with updated user data
   */
  unlinkGoogleAccount: (): Promise<AxiosResponse<GoogleAccountResponse>> => {
    return apiClient.delete(ENDPOINTS.AUTH.GOOGLE.UNLINK)
  },
}
