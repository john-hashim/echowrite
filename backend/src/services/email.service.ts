import { prisma } from '../prisma/client'
import {
  sendEmail,
  generateOTP,
  getOTPExpiration,
  getVerificationEmailTemplate,
} from '../utils/email.utils'

export const sendVerificationEmailService = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email is already verified',
      }
    }

    // Generate OTP and expiration
    const otp = generateOTP()
    const otpExpiration = getOTPExpiration()
    await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: otp,
        otpExpiresAt: otpExpiration,
      },
    })

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Email Verification - Your App Name',
      html: getVerificationEmailTemplate(otp),
    })

    if (!emailSent) {
      return {
        success: false,
        message: 'Failed to send verification email',
      }
    }

    return {
      success: true,
      message: 'Verification email sent successfully',
    }
  } catch (error) {
    console.error('Send verification email error:', error)
    return {
      success: false,
      message: 'Error sending verification email',
    }
  }
}

export const verifyOtpService = async (
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      }
    }
    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email is already verified',
      }
    }
    // Check if OTP exists and is not expired
    if (!user.verificationOtp || !user.otpExpiresAt) {
      return {
        success: false,
        message: 'No active verification code found. Please request a new one.',
      }
    }

    if (new Date() > user.otpExpiresAt) {
      await prisma.user.update({
        where: { email },
        data: {
          verificationOtp: null,
          otpExpiresAt: null,
        },
      })
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      }
    }
    // Verify OTP
    if (user.verificationOtp !== otp) {
      return {
        success: false,
        message: 'Invalid verification code',
      }
    }

    // Mark as verified and clear OTP data
    await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: null,
        otpExpiresAt: null,
        emailVerified: true,
      },
    })
    return {
      success: true,
      message: 'Email verified successfully',
    }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return {
      success: false,
      message: 'Error verifying OTP',
    }
  }
}
