import { ThemeProvider } from '@/contexts/theme-provider'
import { ThemeToggle } from '@/components/common/theme-toggle'
import routes from './routes'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Suspense } from 'react'

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!googleClientId) {
    console.error('Google Client ID is not set in environment variables')
  }
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <GoogleOAuthProvider clientId={googleClientId || ''}>
        <AuthProvider>
          {' '}
          <BrowserRouter>
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center">Loading...</div>
              }
            >
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  )
}

// Separate component for routes that uses the auth context
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth() // Use the auth hook

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public routes accessible to everyone */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            routes.find(r => r.path === '/login')?.element
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            routes.find(r => r.path === '/register')?.element
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            routes.find(r => r.path === '/forgot-password')?.element
          )
        }
      />
      <Route
        path="/reset-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            routes.find(r => r.path === '/reset-password')?.element
          )
        }
      />

      {/* Protected routes that require authentication */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            routes.find(r => r.path === '/dashboard')?.element
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/setup-tone"
        element={
          isAuthenticated ? (
            routes.find(r => r.path === '/setup-tone')?.element
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? (
            routes.find(r => r.path === '/chat')?.element
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/verify-email"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            routes.find(r => r.path === '/verify-email')?.element
          )
        }
      />
      {/* Add other protected routes in a similar way */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Don't forget to import useAuth
import { useAuth } from './contexts/AuthContext'

export default App
