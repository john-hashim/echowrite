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

    // Google Auth endpoints
    GOOGLE: {
      AUTH: '/auth/google', // GET - Get Google auth URL
      CALLBACK: '/auth/google/callback', // GET - Google callback (handled by backend redirect)
      SIGNIN: '/auth/google/signin', // POST - API-based Google sign-in
      LINK: '/auth/google/link', // POST - Link Google account
      UNLINK: '/auth/google/unlink', // DELETE - Unlink Google account
    },
  },
  FEATURE: {
    SET_TONE: '/user/tone',
    ADD_NEW_THREAD: '/chat/new',
    GET_THREADS: '/chat',
    GET_THREAD: '/chat/:threadID',
    ADD_MESSAGE: '/chat/:threadID/message',
    UPDATE_THREAD: '/chat/:threadID',
    DELETE_THREAD: '/chat/:threadID',
  },
} as const

export type EndpointValues = typeof ENDPOINTS
