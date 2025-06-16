import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../prisma/client'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export const getGoogleAuthUrl = (): string => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ]

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  })
}

// Define proper return type
interface GoogleUserData {
  googleId: string
  email: string
  name?: string
  avatar?: string
  emailVerified?: boolean
}

export const verifyGoogleToken = async (code: string): Promise<GoogleUserData | null> => {
  try {
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    // Validate required fields
    if (!payload?.sub || !payload?.email) {
      console.error('Missing required Google user data:', payload)
      return null
    }

    return {
      googleId: payload.sub, // Google user ID (always present)
      email: payload.email, // Email (always present)
      name: payload.name || undefined,
      avatar: payload.picture || undefined,
      emailVerified: payload.email_verified || false,
    }
  } catch (error) {
    console.error('Google token verification error:', error)
    return null
  }
}

export const findOrCreateGoogleUser = async (googleData: GoogleUserData) => {
  try {
    // Check if user exists with Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: googleData.googleId },
    })

    if (user) {
      // Update user info if needed (avatar, name might change)
      user = await prisma.user.update({
        where: { googleId: googleData.googleId },
        data: {
          name: googleData.name || user.name, // Keep existing name if Google doesn't provide one
          avatar: googleData.avatar || user.avatar,
          emailVerified: googleData.emailVerified || user.emailVerified,
        },
      })
      return { user, isNew: false }
    }

    // Check if user exists with email
    user = await prisma.user.findUnique({
      where: { email: googleData.email },
    })

    if (user) {
      // Check if this user already has a Google ID (shouldn't happen, but safety check)
      if (user.googleId) {
        throw new Error('User already has a different Google account linked')
      }

      // Link Google account to existing user
      user = await prisma.user.update({
        where: { email: googleData.email },
        data: {
          googleId: googleData.googleId,
          avatar: googleData.avatar || user.avatar,
          provider: 'google', // Update provider since they're now using Google
          emailVerified: googleData.emailVerified || user.emailVerified,
          name: googleData.name || user.name,
        },
      })
      return { user, isNew: false }
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        googleId: googleData.googleId,
        email: googleData.email,
        name: googleData.name || null,
        avatar: googleData.avatar || null,
        provider: 'google',
        emailVerified: googleData.emailVerified || true, // Google emails are usually verified
        password: '', // No password for Google users
      },
    })

    return { user, isNew: true }
  } catch (error) {
    console.error('Find or create Google user error:', error)
    throw error
  }
}

// Additional utility function to check if Google user data is valid
export const isValidGoogleData = (data: any): data is GoogleUserData => {
  return (
    data &&
    typeof data.googleId === 'string' &&
    data.googleId.length > 0 &&
    typeof data.email === 'string' &&
    data.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  )
}
