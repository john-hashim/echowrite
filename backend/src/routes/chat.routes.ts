import express from 'express'
import * as authMiddleware from '../middleware/auth.middleware'
import {
  createThread,
  getThreads,
  getThread,
  deleteThread,
  updateThread,
  addMessage,
} from '../controllers/chat.controller'

const router = express.Router()

router.post('/new', authMiddleware.authenticateToken, createThread)
router.get('/', authMiddleware.authenticateToken, getThreads)
router.get('/:threadId', authMiddleware.authenticateToken, getThread)
router.post('/:threadId/message', authMiddleware.authenticateToken, addMessage)
router.put('/:threadId', authMiddleware.authenticateToken, updateThread)
router.delete('/:threadId', authMiddleware.authenticateToken, deleteThread)

export default router
