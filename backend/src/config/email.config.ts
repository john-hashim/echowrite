import nodemailer from 'nodemailer'

export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your email password or app password
  },
}
// Create transporter
export const transporter = nodemailer.createTransport(emailConfig)

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify()
    console.log('Email configuration verified successfully')
  } catch (error) {
    console.error('Email configuration error:', error)
  }
}
