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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authService } from '@/api/services/auth'
import { BasicResponce, ResetPasswordInterface } from '@/types/auth'
import { useApi } from '@/hooks/useApi'
import { Spinner } from '@/components/ui/spinner'

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

  const isFormDisabled = loading || serverLoading

  if (success) {
    return (
      <div className="echowrite-login-page h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-5 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#B4400A] via-[#C66A00] to-[#C69000] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Password Reset Successful
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Your password has been successfully reset. You can now login with your new password.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-1">
              <Link to="/login" className="w-full">
                <Button className="w-full h-10 bg-gradient-to-r from-[#A43A09] via-[#B65A00] to-[#B68000] hover:from-[#943309] hover:via-[#A55000] hover:to-[#A57000] text-white font-medium shadow-lg shadow-orange-900/25 transition-all duration-200 transform hover:scale-[1.02]">
                  Go to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="echowrite-login-page h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#B4400A] via-[#C66A00] to-[#C69000] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-white">{userEmail}</span>
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-300">
                  Verification Code
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    disabled={isFormDisabled}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    className="echowrite-input pl-10 h-10 text-lg tracking-widest transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={isFormDisabled}
                    className="echowrite-input pl-10 pr-10 h-10 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isFormDisabled}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="min-h-16 flex items-center">
                {error && (
                  <Alert className="border-red-600 bg-red-900/50">
                    <AlertTitle className="text-red-300">Oops!</AlertTitle>
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                {serverError && !error && (
                  <Alert className="border-red-600 bg-red-900/50">
                    <AlertTitle className="text-red-300">Oops!</AlertTitle>
                    <AlertDescription className="text-red-200">{serverError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-1">
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-[#A43A09] via-[#B65A00] to-[#B68000] hover:from-[#943309] hover:via-[#A55000] hover:to-[#A57000] text-white font-medium shadow-lg shadow-orange-900/25 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isFormDisabled}
              >
                {isFormDisabled ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="dark:text-black text-white" />
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center text-sm space-y-2">
                <Link
                  to="/forgot-password"
                  className="block font-medium text-[#B4400A] hover:text-[#C66A00] transition-colors"
                >
                  Didn't receive code? Send again
                </Link>
                <Link
                  to="/login"
                  className="block font-medium text-[#B4400A] hover:text-[#C66A00] transition-colors"
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

export default ResetPassword
