import { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../prisma/client'
import {
  getGoogleAuthUrl,
  verifyGoogleToken,
  findOrCreateGoogleUser,
} from '../services/googleAuth.service'

/**
 * Generate secure random token (same as auth controller)
 */
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session for a user (same as auth controller)
 */
const createSession = async (userId: string) => {
  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Create session with token
  const session = await prisma.session.create({
    data: {
      userId,
      token: generateToken(),
      expiresAt,
    },
  })

  return session
}

/**
 * Initiate Google OAuth flow - returns Google auth URL
 */
export const googleAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const authUrl = getGoogleAuthUrl()

    return res.status(200).json({
      success: true,
      authUrl,
      message: 'Google auth URL generated successfully',
    })
  } catch (error) {
    console.error('Google auth URL error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error generating Google auth URL',
    })
  }
}

/**
 * Handle Google OAuth callback and create/login user
 */
export const googleCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('working')
    const { code } = req.query

    if (!code || typeof code !== 'string') {
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=missing_code`
      return res.redirect(errorUrl)
    }

    // Verify Google token
    const googleData = await verifyGoogleToken(code)

    if (!googleData) {
      console.error('Failed to verify Google token or get user data')
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=invalid_token`
      return res.redirect(errorUrl)
    }

    // Find or create user
    const { user, isNew } = await findOrCreateGoogleUser(googleData)

    // Create session (same pattern as your auth controller)
    const session = await createSession(user.id)

    // For web redirect (traditional OAuth flow)
    // Set session token as cookie
    res.cookie('auth_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match session expiration
      path: '/',
    })

    // Redirect to frontend with success
    const redirectUrl = isNew
      ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/welcome?google_auth=success`
      : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?google_auth=success`

    return res.redirect(redirectUrl)
  } catch (error) {
    console.error('Google callback error:', error)
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`
    return res.redirect(errorUrl)
  }
}

/**
 * Alternative: Google Sign-In for API (returns JSON instead of redirect)
 * This is useful if you want to handle Google auth via AJAX/API calls
 */
export const googleSignInAPI = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      })
    }

    // Verify Google token
    const googleData = await verifyGoogleToken(code)

    if (!googleData) {
      return res.status(400).json({
        success: false,
        message: 'Failed to verify Google token',
      })
    }

    // Find or create user
    const { user, isNew } = await findOrCreateGoogleUser(googleData)

    // Create session
    const session = await createSession(user.id)

    // Return JSON response (similar to your login controller)
    return res.status(200).json({
      success: true,
      message: isNew ? 'Account created and logged in successfully' : 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified,
      },
      token: session.token,
      isNewUser: isNew,
    })
  } catch (error) {
    console.error('Google sign-in API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error processing Google sign-in',
    })
  }
}

/**
 * Link Google account to existing user (for users who want to add Google login)
 */
export const linkGoogleAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    // req.user is set by authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
    }

    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      })
    }

    // Verify Google token
    const googleData = await verifyGoogleToken(code)

    if (!googleData) {
      return res.status(400).json({
        success: false,
        message: 'Failed to verify Google token',
      })
    }

    // Check if Google account is already linked to another user
    const existingGoogleUser = await prisma.user.findUnique({
      where: { googleId: googleData.googleId },
    })

    if (existingGoogleUser && existingGoogleUser.id !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: 'This Google account is already linked to another user',
      })
    }

    // Link Google account to current user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        googleId: googleData.googleId,
        avatar: googleData.avatar || undefined,
        // Don't change provider if user originally signed up with email
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        googleId: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Google account linked successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Link Google account error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error linking Google account',
    })
  }
}

/**
 * Unlink Google account from user
 */
export const unlinkGoogleAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if user has a password (if not, they can't unlink Google)
    if (!user.password && user.provider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink Google account. Please set a password first.',
      })
    }

    // Unlink Google account
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        googleId: null,
        // Keep avatar if user wants
        // avatar: null, // Uncomment if you want to remove avatar too
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        googleId: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Google account unlinked successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Unlink Google account error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error unlinking Google account',
    })
  }
}
