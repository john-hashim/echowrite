import type React from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/api/services/auth'
import { BasicResponce, ResetPasswordInterface } from '@/types/auth'
import { useApi } from '@/hooks/useApi'

const ResetPassword: React.FC = () => {
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state
  const userEmail = state?.email || ''

  const {
    execute: excuteResetPassword,
    loading: serverLoading,
    error: serverError,
  } = useApi<BasicResponce, [ResetPasswordInterface]>(authService.resetPassword)

  useEffect(() => {
    if (!userEmail) {
      navigate('/login')
    }
  }, [userEmail])

  useEffect(() => {
    if (!serverLoading) {
      setLoading(serverLoading)
    }
  }, [serverLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    const params: ResetPasswordInterface = {
      newPassword,
      otp,
      email: userEmail,
    }

    setLoading(true)
    try {
      const result = await excuteResetPassword(params)
      if (result.success) {
        setSuccess(true)
      }
    } catch (error) {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been successfully reset. You can now login with your new password.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter the 6-digit code sent to {userEmail}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter Otp"
                value={otp}
                disabled={loading}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                className="text-lg tracking-widest"
                required
              />
            </div>

            <div className="space-y-2 mb-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="mb-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {serverError && !error && (
              <Alert className="mb-2">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <div className="flex w-full flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center text-sm space-y-2">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Didn't receive code? Send again
                </Link>
                <div>
                  <Link to="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ResetPassword
