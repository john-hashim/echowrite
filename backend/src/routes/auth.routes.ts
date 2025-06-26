// src/routes/auth.routes.ts
import express from 'express'
import * as authController from '../controllers/auth.controller'
import * as authMiddleware from '../middleware/auth.middleware'

const router = express.Router()

router.post('/google/signin', authController.googleSignIn)

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
