// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: any
      session?: any
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || new Date() > session.expiresAt) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } })
      }
      return res.status(401).json({ message: 'Session expired or invalid' })
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    }
    req.session = session

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ message: 'Authentication failed' })
  }
}

export const userExists = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    }

    next()
  } catch (error) {
    console.error('User exists check error:', error)
    return res.status(500).json({ message: 'Failed to verify user' })
  }
}

export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailVerified: true, email: true },
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email to access this feature',
        needsEmailVerification: true,
        email: user.email,
      })
    }
    next()
  } catch (error) {
    console.error('Email verification check error:', error)
    return res.status(500).json({ message: 'Failed to verify email status' })
  }
}
