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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail } from 'lucide-react'
import { authService } from '@/api/services/auth'
import { BasicResponce } from '@/types/auth'
import { useApi } from '@/hooks/useApi'
import { useNavigate } from 'react-router-dom'

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!success ? (
              <div className="space-y-2 mb-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            ) : (
              <Alert className="bg-green-50 border-green-200 mb-2">
                <AlertDescription className="text-green-800">
                  If an account exists with {email}, we've sent you instructions to reset your
                  password.
                </AlertDescription>
              </Alert>
            )}
            {displayError && (
              <Alert className="mb-2">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col space-y-4">
              {!success ? (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>
              ) : (
                <Button type="button" className="w-full" onClick={handleSendAgain}>
                  Send Again
                </Button>
              )}
              <div className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ForgotPassword
