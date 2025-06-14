import { prisma } from '../prisma/client'
import {
  sendEmail,
  generateOTP,
  getOTPExpiration,
  getVerificationEmailTemplate,
  getForgotPasswordEmailTemplate,
} from '../utils/email.utils'
import bcrypt from 'bcrypt'

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

export const requestPasswordResetOtpService = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return {
        success: true,
        message: 'If an account with that email exists, a reset code has been sent',
      }
    }

    const otp = generateOTP()
    const otpExpiration = getOTPExpiration()

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetToken: otp,
        resetTokenExpires: otpExpiration,
      },
    })

    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset - Your App Name',
      html: getForgotPasswordEmailTemplate(otp),
    })

    if (!emailSent) {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          resetToken: null,
          resetTokenExpires: null,
        },
      })

      return {
        success: false,
        message: 'Failed to send password reset email',
      }
    }

    return {
      success: true,
      message: 'If an account with that email exists, a reset code has been sent',
    }
  } catch (error) {
    console.error('Send password reset OTP error:', error)
    return {
      success: false,
      message: 'Error processing password reset request',
    }
  }
}

export const verifyPasswordResetOtpService = async (
  email: string,
  otp: string
): Promise<{ success: boolean; message: string; isValid?: boolean }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return {
        success: false,
        message: 'Invalid reset request',
      }
    }

    if (!user.resetToken || !user.resetTokenExpires) {
      return {
        success: false,
        message: 'No active reset request found. Please request a new password reset.',
      }
    }

    if (new Date() > user.resetTokenExpires) {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          resetToken: null,
          resetTokenExpires: null,
        },
      })
      return {
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      }
    }

    if (user.resetToken !== otp) {
      return {
        success: false,
        message: 'Invalid reset code',
      }
    }

    return {
      success: true,
      message: 'Reset code verified successfully',
      isValid: true,
    }
  } catch (error) {
    console.error('Verify password reset OTP error:', error)
    return {
      success: false,
      message: 'Error verifying reset code',
    }
  }
}

export const resetPasswordService = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const verificationResult = await verifyPasswordResetOtpService(email, otp)

    if (!verificationResult.success || !verificationResult.isValid) {
      return verificationResult
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return {
      success: true,
      message: 'Password reset successfully',
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      message: 'Error resetting password',
    }
  }
}
