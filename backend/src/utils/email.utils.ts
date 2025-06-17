import { transporter } from '../config/email.config'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send email utility function
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<Boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@youremail.com',
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.log('Email sending Error', error)
    return false
  }
}

/**
 * Generate OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate expiration time
 */
export const getOTPExpiration = (): Date => {
  const expiration = new Date()
  expiration.setMinutes(expiration.getMinutes() + 10)
  return expiration
}

/**
 * Generate verification email HTML template
 */
export const getVerificationEmailTemplate = (otp: string): string => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .otp-code { font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Your App Name. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
}

export const getForgotPasswordEmailTemplate = (otp: string): string => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .otp-code { font-size: 24px; font-weight: bold; color: #dc3545; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Please use the following code to proceed with your password reset:</p>
            <div class="otp-code">${otp}</div>
            <p>Enter this code in the password reset form to create your new password.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This password reset code will expire in 10 minutes for security reasons. If you didn't request this password reset, please ignore this email or contact our support team.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Your App Name. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
}
