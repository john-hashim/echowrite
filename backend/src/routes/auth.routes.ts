// src/routes/auth.routes.ts
import express from 'express'
import * as authController from '../controllers/auth.controller'
import * as googleAuthController from '../controllers/googleAuth.controller'
import * as authMiddleware from '../middleware/auth.middleware'

const router = express.Router()

// routes/auth.routes.ts
router.get('/google', googleAuthController.googleAuth) // Get Google auth URL
router.get('/google/callback', googleAuthController.googleCallback)
router.post('/google/signin', googleAuthController.googleSignInAPI) // API-based signin
router.post(
  '/google/link',
  authMiddleware.authenticateToken,
  googleAuthController.linkGoogleAccount
) // Link account
router.delete(
  '/google/unlink',
  authMiddleware.authenticateToken,
  googleAuthController.unlinkGoogleAccount
) // Unlink

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/request-password-reset', authController.requestPasswordReset)
router.post('/reset-password', authController.resetPassword)
router.post('/send-verification-email', authController.sendVerificationEmail)
router.post('/verify-otp', authController.verifyOtp)

// Protected routes
router.get('/me', authMiddleware.authenticateToken, authController.getMe)
router.post('/logout', authMiddleware.authenticateToken, authController.logout)

export default router
