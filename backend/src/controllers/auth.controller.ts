// src/controllers/auth.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { prisma } from '../prisma/client'
import { sendVerificationEmailService, verifyOtpService } from '../services/email.service'
import { SendVerificationEmailRequest } from '../types/auth.types'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name?: string
}

/**
 * Generate secure random token
 */
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session for a user
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
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name }: RegisterData = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (!existingUser.emailVerified) {
        return res.status(409).json({
          message: 'User already exists',
        })
      }
      return res.status(409).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: false,
      },
    })

    // Send verification email
    const emailResult = await sendVerificationEmailService(user.email)

    if (!emailResult.success) {
      // If email fails, we could either:
      // 1. Delete the user and return error
      // 2. Keep user and let them resend later (recommended)
      console.warn('Failed to send verification email to:', user.email)
    }

    // Return user data and token
    return res.status(201).json({
      message: 'Registration successful! Please check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      emailSent: emailResult.success,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Error registering user' })
  }
}

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password }: LoginCredentials = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.emailVerified) {
      // Automatically send verification email
      const verificationResult = await sendVerificationEmailService(email.toLowerCase())

      return res.status(409).json({
        message: 'Account exists but email not verified. Verification email sent.',
        emailVerified: false,
        action: 'verify-email',
        email: email.toLowerCase(),
        verificationEmailSent: verificationResult.success,
      })
    }
    // Create new session
    const session = await createSession(user.id)

    // Return user data and token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: session.token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Error logging in' })
  }
}

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    // Get session from request (set by authenticateToken middleware)
    const session = req.session
    if (!session) {
      return res.status(400).json({ success: true })
    }

    // Delete the session
    await prisma.session.delete({
      where: { id: session.id },
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ success: false })
  }
}

/**
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    // req.user is set by the authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({ message: 'Error fetching user profile' })
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.status(200).json({
        message: 'If an account with that email exists, a reset link has been sent',
      })
    }

    // Generate reset token
    const resetToken = generateToken()

    // Set token expiration (1 hour from now)
    const resetTokenExpires = new Date()
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1)

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // In a real app, you would send an email with the reset token
    // For development, we'll just return it
    return res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent',
      // Include reset token in development only
      dev: { resetToken },
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return res.status(500).json({ message: 'Error processing password reset request' })
  }
}

/**
 * Reset password using token
 */
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { resetToken, newPassword } = req.body

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' })
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    // Clear any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    return res.status(200).json({
      message: 'Password reset successful. Please login with your new password.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return res.status(500).json({ message: 'Error resetting password' })
  }
}

/**
 * Send verification email (Simplified for registered users)
 */
export const sendVerificationEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email }: SendVerificationEmailRequest = req.body

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Find existing user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' })
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' })
    }

    // Send verification email
    const result = await sendVerificationEmailService(email.toLowerCase())

    if (!result.success) {
      return res.status(500).json({ message: result.message })
    }

    return res.status(200).json({
      message: 'Verification email sent successfully',
      email: email.toLowerCase(),
    })
  } catch (error) {
    console.error('Send verification email error:', error)
    return res.status(500).json({ message: 'Error sending verification email' })
  }
}

export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  const { email, otp } = req.body

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  // Validate OTP format (6 digits)
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'OTP must be 6 digits' })
  }

  // Verify OTP
  const result = await verifyOtpService(email.toLowerCase(), otp)

  if (!result.success) {
    return res.status(400).json({ message: result.message })
  }

  // OTP verified successfully - now create session and return token
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
    },
  })

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  // Create session for the verified user
  const session = await createSession(user.id)

  // Return success with token - user is now fully registered and logged in
  return res.status(200).json({
    message: 'Email verified successfully! You are now logged in.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
    },
    token: session.token,
    verified: true,
  })
}
