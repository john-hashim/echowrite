import { ThemeProvider } from '@/contexts/theme-provider'
// import { ThemeToggle } from '@/components/common/theme-toggle'
import routes from './routes'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useAppStore } from './store/appStore'
import { AppStore } from './types/store'

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!googleClientId) {
    console.error('Google Client ID is not set in environment variables')
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <GoogleOAuthProvider clientId={googleClientId || ''}>
        <AuthProvider>
          <BrowserRouter>
            {/* <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div> */}
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

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  requiresTone?: boolean
}

function ProtectedRoute({ children, requiresTone = false }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const user = useAppStore((state: AppStore) => state.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If route requires tone but user doesn't have it, redirect to setup
  if (requiresTone && !user?.toneText) {
    return <Navigate to="/setup-tone" replace />
  }

  // If user has tone but is trying to access setup-tone, redirect to chat
  if (!requiresTone && user?.toneText && location.pathname === '/setup-tone') {
    return <Navigate to="/chat/new" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirects authenticated users appropriately)
interface PublicRouteProps {
  children: React.ReactNode
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth()
  const user = useAppStore((state: AppStore) => state.user)

  if (isAuthenticated) {
    // If authenticated, redirect based on toneText status
    return user?.toneText ? (
      <Navigate to="/chat/new" replace />
    ) : (
      <Navigate to="/setup-tone" replace />
    )
  }

  return <>{children}</>
}

// Main Routes Component
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()
  const user = useAppStore((state: AppStore) => state.user)

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  // Helper function to find route element
  const getRouteElement = (path: string) => {
    return routes.find(r => r.path === path)?.element
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.toneText ? (
              <Navigate to="/chat/new" replace />
            ) : (
              <Navigate to="/setup-tone" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public routes - accessible only when not authenticated */}
      <Route path="/login" element={<PublicRoute>{getRouteElement('/login')}</PublicRoute>} />

      <Route path="/register" element={<PublicRoute>{getRouteElement('/register')}</PublicRoute>} />

      <Route
        path="/forgot-password"
        element={<PublicRoute>{getRouteElement('/forgot-password')}</PublicRoute>}
      />

      <Route
        path="/reset-password"
        element={<PublicRoute>{getRouteElement('/reset-password')}</PublicRoute>}
      />

      <Route
        path="/verify-email"
        element={<PublicRoute>{getRouteElement('/verify-email')}</PublicRoute>}
      />

      {/* Protected routes that require authentication */}

      {/* Setup tone route - requires auth but not toneText */}
      <Route
        path="/setup-tone"
        element={
          <ProtectedRoute requiresTone={false}>{getRouteElement('/setup-tone')}</ProtectedRoute>
        }
      />

      {/* Chat routes - requires auth and toneText */}
      <Route path="/chat" element={<Navigate to={'/chat/new'} replace />} />

      <Route
        path="/chat/new"
        element={<ProtectedRoute requiresTone={true}>{getRouteElement('/chat')}</ProtectedRoute>}
      />

      <Route
        path="/chat/:threadId"
        element={<ProtectedRoute requiresTone={true}>{getRouteElement('/chat')}</ProtectedRoute>}
      />

      {/* Catch all route - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
