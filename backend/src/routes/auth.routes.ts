// src/routes/auth.routes.ts
import express from 'express';
import * as authController from '../controllers/auth.controller';
import * as authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware.authenticateToken, authController.getMe);
router.post('/logout', authMiddleware.authenticateToken, authController.logout);

export default router;