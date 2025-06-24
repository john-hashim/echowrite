import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useApi } from '@/hooks/useApi'
import {
  authService,
  LoginCredentials,
  AuthResponse,
  GoogleSignInRequest,
} from '@/api/services/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import { useUserStore } from '@/store/userStore'

const Login: React.FC = () => {
  const { setUser } = useUserStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [clicked, setClicked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorValue, setErrorValue] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    execute: executeLogin,
    loading,
    error: serverError,
    data,
  } = useApi<AuthResponse, [LoginCredentials]>(authService.login)

  const {
    execute: executeGoogleSignIn,
    loading: googleLoading,
    error: googleError,
  } = useApi<AuthResponse, [GoogleSignInRequest]>(authService.googleSignIn)

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
    if (googleError) {
      setErrorValue(googleError)
    }
  }, [googleError])

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
      if (response && response.token) {
        setUser(response.user)
        login(response.token, formData.rememberMe)
        // Use setTimeout to ensure auth state is set first
        setTimeout(() => {
          if (!response.user.toneText) {
            navigate('/setup-tone')
          } else {
            navigate('/chat')
          }
        }, 0)
      }
    } catch (err) {
      // Error is handled by useApi hook and will show in serverError
      console.error('Login failed:', err)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorValue('Failed to get Google credentials')
      return
    }

    try {
      setErrorValue('')

      // Send the Google credential token to your backend
      const response = await executeGoogleSignIn({
        code: credentialResponse.credential,
      })

      if (response && response.token) {
        setUser(response.user)
        login(response.token, true)
        setTimeout(() => {
          if (!response.user.toneText) {
            navigate('/setup-tone')
          } else {
            navigate('/chat')
          }
        }, 0)
      }
    } catch (err) {
      console.error('Google login failed:', err)
    }
  }

  const handleGoogleError = () => {
    setErrorValue('Google sign-in failed. Please try again.')
  }

  const isFormDisabled = loading || clicked || googleLoading

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

            {/* Google Login Button */}
            <div className="w-full">
              {googleLoading ? (
                <Button variant="outline" className="w-full" disabled>
                  <Spinner className="mr-2" />
                  Connecting...
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  width={384} // Set explicit width for full width
                  useOneTap
                  auto_select={false}
                />
              )}
            </div>

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
