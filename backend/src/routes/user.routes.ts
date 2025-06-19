import express from 'express'
import * as authMiddleware from '../middleware/auth.middleware'
import { updateUserToneHandler } from '../controllers/user.controller'

const router = express.Router()

router.post('/tone', authMiddleware.authenticateToken, updateUserToneHandler)

export default router
