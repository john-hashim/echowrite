import { useState, FormEvent, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useApi } from '@/hooks/useApi'
import { authService, LoginCredentials, AuthResponse } from '@/api/services/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [clicked, setClicked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorValue, setErrorValue] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    execute: executeLogin,
    loading,
    error: serverError,
    data,
  } = useApi<AuthResponse, [LoginCredentials]>(authService.login)

  const {
    execute: executeGoogleAuth,
    loading: googleAuthLoading,
    error: googleAuthError,
  } = useApi<{ success: boolean; authUrl: string; message: string }, []>(authService.googleAuth)

  // Check for Google auth callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const googleAuthStatus = urlParams.get('google_auth')
    const error = urlParams.get('error')

    if (googleAuthStatus === 'success') {
      // User successfully authenticated with Google
      // The backend should have set the auth cookie, so redirect to dashboard
      navigate('/dashboard')
    } else if (error) {
      // Handle Google auth errors
      const errorMessages: { [key: string]: string } = {
        missing_code: 'Google authentication failed. Please try again.',
        invalid_token: 'Invalid Google authentication. Please try again.',
        auth_failed: 'Authentication failed. Please try again.',
      }
      setErrorValue(errorMessages[error] || 'Authentication failed. Please try again.')

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [navigate])

  useEffect(() => {
    if (data?.action === 'verify-email') {
      navigate('/verify-email', {
        state: {
          email: formData.email,
          fromLogin: true,
        },
      })
    }
  }, [data, formData.email, navigate])

  useEffect(() => {
    if (serverError) {
      setErrorValue(serverError)
    }
  }, [serverError, loading])

  useEffect(() => {
    if (googleAuthError) {
      setErrorValue(googleAuthError)
    }
  }, [googleAuthError])

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }))
  }

  const getValidationError = () => {
    if (!formData.email.trim() && !formData.password) {
      return 'Email and password are required'
    }
    if (!formData.email.trim()) {
      return 'Email is required'
    }
    if (!formData.password) {
      return 'Password is required'
    }
    if (!isValidEmail(formData.email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setClicked(true)
    setTimeout(() => {
      setClicked(false)
    }, 200)

    setErrorValue('')
    const validationError = getValidationError()
    if (validationError) {
      setErrorValue(validationError)
      return
    }

    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password,
      }
      const response = await executeLogin(credentials)

      if (response) {
        login(response.token, formData.rememberMe)
        navigate('/dashboard')
      }
    } catch (err) {
      // Error is handled by useApi hook and will show in serverError
      console.error('Login failed:', err)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorValue('')
    setGoogleLoading(true)

    try {
      const response = await executeGoogleAuth()

      if (response?.success && response.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.authUrl
      } else {
        setErrorValue('Failed to initiate Google sign-in. Please try again.')
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      setErrorValue('Error connecting to Google. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const isFormDisabled = loading || clicked || googleLoading || googleAuthLoading

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-0.5 pb-4">
          <CardTitle className="text-xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute cursor-pointer inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-0">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={checked => {
                  setFormData(prev => ({
                    ...prev,
                    rememberMe: checked as boolean,
                  }))
                }}
                disabled={isFormDisabled}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>

            <div className="min-h-20 flex items-center">
              {errorValue && (
                <Alert>
                  <AlertTitle>Oops!</AlertTitle>
                  <AlertDescription>{errorValue}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-1">
            <Button type="submit" className="w-full" disabled={isFormDisabled}>
              {(loading || clicked) && <Spinner className="dark:text-black text-white mr-2" />}
              Sign in
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isFormDisabled}
            >
              {googleLoading || googleAuthLoading ? (
                <Spinner className="mr-2" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="w-5 h-5"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
              )}
              {googleLoading || googleAuthLoading ? 'Connecting...' : 'Sign in with Google'}
            </Button>

            <div className="text-center text-sm pt-1">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login
