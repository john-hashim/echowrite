import React, { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
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
import { Eye, EyeOff, Mail, Lock, User, MessageCircle, Sparkles, Brain, Zap } from 'lucide-react'
import { authService } from '@/api/services/auth'
import { AuthResponse, GoogleSignInRequest, RegisterData } from '@/types/auth'
import { useApi } from '@/hooks/useApi'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/appStore'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: false,
  })

  const [clicked, setClicked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorValue, setErrorValue] = useState('')

  const navigate = useNavigate()

  const { setUser } = useAppStore()
  const { login } = useAuth()

  const {
    execute: executeRegister,
    loading,
    error: serverError,
  } = useApi<AuthResponse, [RegisterData]>(authService.register)

  const {
    execute: executeGoogleSignIn,
    loading: googleLoading,
    error: googleError,
  } = useApi<AuthResponse, [GoogleSignInRequest]>(authService.googleSignIn)

  useEffect(() => {
    if (serverError) {
      setErrorValue(serverError)
    }
  }, [serverError])

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
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      return 'Please fill in all fields'
    }
    if (!isValidEmail(formData.email)) {
      return 'Please enter a valid email address'
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    if (!formData.agreeTerms) {
      return 'You must agree to the terms and conditions'
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }
      const response = await executeRegister(credentials)

      if (response) {
        navigate('/verify-email', {
          state: {
            email: formData.email,
          },
        })
      }
    } catch (err) {
      // Error is handled by useApi hook and will show in serverError
      console.error('Registration failed:', err)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorValue('Failed to get Google credentials')
      return
    }

    try {
      setErrorValue('')
      const response = await executeGoogleSignIn({
        code: credentialResponse.credential,
      })

      if (response && response.token) {
        setUser(response.user)
        login(response.token, true)
      }
    } catch (err) {
      console.error('Google login failed:', err)
    }
  }

  const handleGoogleError = () => {
    setErrorValue('Google sign-in failed. Please try again.')
  }

  const isFormDisabled = loading || clicked || googleLoading

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Intelligent Writing',
      description:
        'AI-powered assistance that understands context and helps you write better content',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Style Adaptation',
      description:
        'Adapts to your unique voice and writing style for consistent, personalized output',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Results',
      description: 'Lightning-fast processing to keep your creative flow uninterrupted',
    },
  ]

  return (
    <div className="echowrite-login-page h-screen flex overflow-hidden">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="w-full max-w-sm">
          <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#B4400A] via-[#C66A00] to-[#C69000] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">Create Account</CardTitle>
                </div>
              </div>
              <CardDescription className="text-gray-400 text-sm">
                Join EchoWrite today
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isFormDisabled}
                      className="echowrite-input pl-10 h-10 transition-all duration-200"
                    />
                  </div>
                </div>

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
                      name="email"
                      type="text"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isFormDisabled}
                      className="echowrite-input pl-10 h-10 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isFormDisabled}
                      className="echowrite-input pl-10 pr-10 h-10 transition-all duration-200"
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

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={checked => {
                      setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                    }}
                    disabled={isFormDisabled}
                    className="border-2 border-border data-[state=checked]:bg-[#B4400A] data-[state=checked]:border-[#B4400A] mt-0.5 flex-shrink-0"
                  />
                  <Label
                    htmlFor="agreeTerms"
                    className="text-xs font-medium text-gray-300 cursor-pointer leading-4"
                  >
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-[#B4400A] hover:text-[#C66A00] transition-colors"
                    >
                      terms of service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-[#B4400A] hover:text-[#C66A00] transition-colors"
                    >
                      privacy policy
                    </Link>
                  </Label>
                </div>

                <div className="min-h-16 flex items-center">
                  {errorValue && (
                    <Alert className="border-red-600 bg-red-900/50">
                      <AlertTitle className="text-red-300">Oops!</AlertTitle>
                      <AlertDescription className="text-red-200">{errorValue}</AlertDescription>
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
                  {(loading || clicked) && <Spinner className="dark:text-black text-white mr-2" />}
                  Create Account
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-3 text-gray-400 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div className="w-full flex justify-center">
                  {googleLoading ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 border-2 border-gray-700 bg-black/50 text-gray-300"
                      disabled
                    >
                      <Spinner className="mr-2" />
                      Connecting...
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-center max-w-[384px]">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width={300}
                        useOneTap
                        auto_select={false}
                      />
                    </div>
                  )}
                </div>

                <div className="text-center text-sm pt-1">
                  <span className="text-gray-400">Already have an account? </span>
                  <Link
                    to="/login"
                    className="font-medium text-[#B4400A] hover:text-[#C66A00] transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right Side - App Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#C4500A] via-[#8B4513] to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-2xl"></div>
          <div className="absolute bottom-40 right-10 w-28 h-28 bg-white rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center px-8 py-12 xl:px-12 xl:py-16 text-white">
          <div className="max-w-lg text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4 leading-tight">EchoWrite</h1>

            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Your intelligent writing companion. Experience AI that understands your voice, adapts
              to your style, and elevates your content.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
