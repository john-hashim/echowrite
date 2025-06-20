import { ThemeProvider } from '@/contexts/theme-provider'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuth } from './contexts/AuthContext'
import { Login, Register } from '@/pages'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import EmailVerification from '@/pages/auth/EmailVerification'
import SetupTone from '@/pages/onboarding/SetupTone'
import ChatComponent from '@/pages/chat/Chat'
import { useUser } from '@/store'

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!googleClientId) {
    console.error('Google Client ID is not set in environment variables')
  }
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <GoogleOAuthProvider clientId={googleClientId || ''}>
        <BrowserRouter>
          <AuthProvider>
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  )
}

// Separate component for routes that uses the auth context
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()
  const user = useUser()

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public routes accessible to everyone */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <ResetPassword />}
      />
      <Route
        path="/verify-email"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <EmailVerification />}
      />

      {/* Protected routes */}
      <Route
        path="/setup-tone"
        element={isAuthenticated ? <SetupTone /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? (
            user && !user.toneText ? (
              <Navigate to="/setup-tone" replace />
            ) : (
              <ChatComponent />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
