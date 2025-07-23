import type React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Mail } from 'lucide-react'
import { authService } from '@/api/services/auth'
import { BasicResponce } from '@/types/auth'
import { useApi } from '@/hooks/useApi'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()

  const {
    execute: executeRequestResetOtp,
    loading,
    error: serverError,
  } = useApi<BasicResponce, [string]>(authService.requestPasswordReset)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!email) {
      setLocalError('Please enter a email address')
    }
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address')
      return
    }

    try {
      const result = await executeRequestResetOtp(email)
      if (result) {
        setSuccess(true)
        navigate('/reset-password', {
          state: {
            email,
          },
        })
      }
    } catch (err) {
      console.error('Failed to send reset password email:', err)
    }
  }

  const handleSendAgain = async () => {
    setSuccess(false)
    setLocalError(null)
  }

  // Combine local validation errors and server errors
  const displayError = localError || serverError

  return (
    <div className="echowrite-login-page h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#B4400A] via-[#C66A00] to-[#C69000] flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Forgot Password</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!success ? (
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </div>
                    <Input
                      id="email"
                      type="text"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      className="echowrite-input pl-10 h-10 transition-all duration-200"
                    />
                  </div>
                </div>
              ) : (
                <Alert className="border-green-600 bg-green-900/50">
                  <AlertTitle className="text-green-300">Success!</AlertTitle>
                  <AlertDescription className="text-green-200">
                    If an account exists with {email}, we've sent you instructions to reset your
                    password.
                  </AlertDescription>
                </Alert>
              )}

              {displayError && (
                <Alert className="border-red-600 bg-red-900/50">
                  <AlertTitle className="text-red-300">Oops!</AlertTitle>
                  <AlertDescription className="text-red-200">{displayError}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-1">
              {!success ? (
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-[#A43A09] via-[#B65A00] to-[#B68000] hover:from-[#943309] hover:via-[#A55000] hover:to-[#A57000] text-white font-medium shadow-lg shadow-orange-900/25 transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="dark:text-black text-white" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full h-10 bg-gradient-to-r from-[#A43A09] via-[#B65A00] to-[#B68000] hover:from-[#943309] hover:via-[#A55000] hover:to-[#A57000] text-white font-medium shadow-lg shadow-orange-900/25 transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={handleSendAgain}
                >
                  Send Again
                </Button>
              )}

              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="font-medium text-[#B4400A] hover:text-[#C66A00] transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword
