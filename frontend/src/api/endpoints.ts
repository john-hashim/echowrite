// src/api/endpoints.ts
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    GET_ME: '/auth/me',
    VERIFY_OTP: '/auth/verify-otp',
  },
} as const

export type EndpointValues = typeof ENDPOINTS
