import React, { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: false,
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: '',
    server: '',
  })

  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleSignIn = () => {
    console.log('Google sign-in clicked')
  }

  const navigate = useNavigate()

  const isValidEmail = (email: string): boolean => {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return emailRegex.test(email)
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    // Update form data with new value
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }))

    // Check if the field is now empty and set appropriate error
    if (name === 'name' && !value.trim()) {
      setErrors(prev => ({
        ...prev,
        name: 'Name is required',
      }))
    } else if (name === 'email') {
      if (!value.trim()) {
        setErrors(prev => ({
          ...prev,
          email: 'Email is required',
        }))
      } else if (!isValidEmail(value)) {
        setErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address',
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          email: '',
        }))
      }
    } else if (name === 'password') {
      if (!value) {
        setErrors(prev => ({
          ...prev,
          password: 'Password is required',
        }))
      } else if (value.length < 6) {
        setErrors(prev => ({
          ...prev,
          password: 'Password must be at least 6 characters',
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          password: '',
        }))
      }
    } else if (name === 'agreeTerms') {
      if (!checked) {
        setErrors(prev => ({
          ...prev,
          agreeTerms: 'You must agree to the terms and conditions',
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          agreeTerms: '',
        }))
      }
    } else {
      // Clear error for this field if it's valid
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    validateField(name)
  }

  // Validate a specific field
  const validateField = (fieldName: string, value?: any) => {
    let newErrors = { ...errors }

    // Use the passed value if provided, otherwise use the value from formData
    const data = {
      ...formData,
      [fieldName]: value !== undefined ? value : formData[fieldName as keyof typeof formData],
    }

    switch (fieldName) {
      case 'name':
        if (!data.name.trim()) {
          newErrors.name = 'Name is required'
        } else {
          newErrors.name = ''
        }
        break
      case 'email':
        if (!data.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!isValidEmail(data.email)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          newErrors.email = ''
        }
        break
      case 'password':
        if (!data.password) {
          newErrors.password = 'Password is required'
        } else if (data.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters'
        } else {
          newErrors.password = ''
        }
        break
      case 'agreeTerms':
        if (!data.agreeTerms) {
          newErrors.agreeTerms = 'You must agree to the terms and conditions'
        } else {
          newErrors.agreeTerms = ''
        }
        break
      default:
        break
    }

    setErrors(newErrors)
    return !newErrors[fieldName as keyof typeof newErrors]
  }

  // Validate all fields
  const validateForm = () => {
    // Create a new errors object to hold all validation errors
    let newErrors = { ...errors }
    let isValid = true

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
      isValid = false
    } else {
      newErrors.name = ''
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    } else {
      newErrors.email = ''
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    } else {
      newErrors.password = ''
    }

    // Validate terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions'
      isValid = false
    } else {
      newErrors.agreeTerms = ''
    }

    // Update all errors at once
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormSubmitted(true) // Mark the form as submitted to show errors

    // Validate all fields and show all errors immediately
    const isValid = validateForm()
    if (!isValid) {
      return
    }

    try {
      const credentials = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }
      // const response = await executeRegister(credentials)
      // login(response.token, false)
      // navigate('/dashboard')
      navigate('/verify-email', {
        state: {
          email: formData.email,
          credentials: credentials, // Pass credentials to use after verification
        },
      })
    } catch (err) {
      // Error is already handled by useApi hook
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-0.5 pb-4">
          <CardTitle className="text-xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={formSubmitted && errors.name ? 'border-red-500' : ''}
              />
              <div className="h-4">
                {formSubmitted && errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={formSubmitted && errors.email ? 'border-red-500' : ''}
              />
              <div className="h-4">
                {formSubmitted && errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={formSubmitted && errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  className="absolute cursor-pointer inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
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
              <div className="h-4">
                {formSubmitted && errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center mb-2">
              <div className="flex h-5 items-center pt-0.5">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={checked => {
                    setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                    if (checked) {
                      setErrors(prev => ({ ...prev, agreeTerms: '' }))
                    } else if (formSubmitted) {
                      setErrors(prev => ({
                        ...prev,
                        agreeTerms: 'You must agree to the terms and conditions',
                      }))
                    }
                  }}
                  className={formSubmitted && errors.agreeTerms ? 'border-red-500' : ''}
                />
              </div>
              <div className="ml-2">
                <Label
                  htmlFor="agreeTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </div>

            {errors.server && (
              <Alert className="my-2">
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{errors.server}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-3">
            <Button type="submit" className="w-full">
              Sign up
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
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
              Sign up with Google
            </Button>
            <div className="text-center text-sm pt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Register
