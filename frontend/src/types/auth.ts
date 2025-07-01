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
  avatar?: string
  provider?: string
  emailVerified?: boolean
  toneText: string | null
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
  isNewUser?: boolean // For Google sign-in
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

// Google Auth interfaces
export interface GoogleAuthResponse {
  success: boolean
  authUrl: string
  message: string
}

export interface GoogleSignInRequest {
  code: string
}

export interface LinkGoogleAccountRequest {
  code: string
}

export interface GoogleAccountResponse {
  success: boolean
  message: string
  user: UserResponse
}
