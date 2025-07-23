import type React from 'react'
import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle2, Mail } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/api/services/auth'
import echowriteLogo from '@/assets/echowrite-logo.png'
import {
  EmailVerificationSendApiResponce,
  verificationResponce,
  verifyOtpParams,
} from '@/types/auth'
import { useApi } from '@/hooks/useApi'
import { useAppStore } from '@/store/appStore'
import { Spinner } from '@/components/ui/spinner'

const EmailVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isComplete, setIsComplete] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  //   const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  // Get the location state containing the email
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { setUser } = useAppStore()

  const state = location.state
  const userEmail = state?.email || ''

  // Create an array of refs using useRef
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const { execute: executeVerifyEmail, loading: verifyLoading } = useApi<
    verificationResponce,
    [verifyOtpParams]
  >(authService.verifyEmail)

  const { execute: executeEmailVerification } = useApi<EmailVerificationSendApiResponce, [string]>(
    authService.sendVerificationEmail
  )

  // Initialize the refs array
  if (!inputRefs.current) {
    inputRefs.current = Array(6).fill(null)
  }

  useEffect(() => {
    if (!userEmail) {
      navigate('/login')
    }
  }, [userEmail])

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = setTimeout(() => {
      setResendCountdown(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [resendCountdown])

  // Check if OTP is complete
  useEffect(() => {
    const isOtpComplete = otp.every(digit => digit !== '')
    setIsComplete(isOtpComplete)

    if (isOtpComplete) {
      // Auto-submit after a brief delay to show the completed state
      const timer = setTimeout(() => {
        handleVerify()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [otp])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    // Take only the last character if multiple characters are entered
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Allow arrow key navigation between inputs
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtp(digits)

      // Focus the last input
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    if (!isComplete) return

    // setIsVerifying(true)
    setVerificationError('')
    try {
      // Construct the OTP from the array
      const otpCode = otp.join('')

      const response = await executeVerifyEmail({ email: userEmail, otp: otpCode })
      if (!response) {
        console.log('verification problem')
      }
      setUser(response.user)
      login(response.token, false)
    } catch (error) {
      setVerificationError('Invalid verification code. Please try again.')
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
    }
  }

  const handleResendOtp = async () => {
    if (isResending || resendCountdown > 0) return

    setIsResending(true)
    setVerificationError('')

    try {
      executeEmailVerification(userEmail)
      setResendCountdown(60)
    } catch (error) {
      console.error('Error resending code:', error)
      setVerificationError('Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const isFormDisabled = verifyLoading || isResending

  return (
    <div className="echowrite-login-page h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm border-0">
          <CardHeader className="space-y-2 pb-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={echowriteLogo} alt="Echowrite Logo" className="w-8 h-8 object-contain" />
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-5 h-5 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verify your email</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Almost there! We've sent a verification code to your email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center text-sm">
              <p className="text-gray-300">
                Please check <span className="font-medium text-white">{userEmail}</span> and enter
                the 6-digit code below to complete your registration.
              </p>
            </div>

            <div className="flex justify-center gap-2 py-4">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="relative">
                    <Input
                      ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`echowrite-input h-14 w-12 text-center text-lg font-semibold sm:h-16 sm:w-14 transition-all duration-200 focus:ring-0 focus:border-gray-600 ${
                        otp[index] ? 'border-[#B4400A] bg-black/70' : ''
                      }`}
                      autoFocus={index === 0}
                      disabled={isFormDisabled}
                    />
                    {otp[index] && (
                      <div className="absolute bottom-0 left-0 right-0 mx-auto h-1 w-8 rounded-full bg-gradient-to-r from-[#B4400A] to-[#C66A00]" />
                    )}
                  </div>
                ))}
            </div>

            {verificationError && (
              <Alert className="border-red-600 bg-red-900/50">
                <AlertTitle className="text-red-300">Oops!</AlertTitle>
                <AlertDescription className="text-red-200">{verificationError}</AlertDescription>
              </Alert>
            )}

            <div className="text-center text-sm text-gray-400">
              <p>Didn't receive the email? Check your spam folder or request a new code.</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-1">
            <Button
              onClick={handleVerify}
              className="w-full h-10 text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0"
              style={{
                background: 'rgba(180, 64, 10, 0.12)',
              }}
              disabled={!isComplete || isFormDisabled}
            >
              {verifyLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="dark:text-white text-white" />
                  Verifying...
                </span>
              ) : isComplete ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Email
                </span>
              ) : (
                'Verify Email'
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isResending || resendCountdown > 0}
              className="w-full h-10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resending code...
                </span>
              ) : resendCountdown > 0 ? (
                `Resend code in ${resendCountdown}s`
              ) : (
                'Resend verification code'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default EmailVerification
