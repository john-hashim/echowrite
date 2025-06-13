// src/api/endpoints.ts
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    GET_ME: '/auth/me',
    VERIFY_OTP: '/auth/verify-otp',
    SEND_VERIFICATION_EMAIL: '/auth/send-verification-email',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
  },
} as const

export type EndpointValues = typeof ENDPOINTS
