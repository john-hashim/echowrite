import { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

// Lazy load components
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const EmailVerification = lazy(() => import('@/pages/auth/EmailVerification'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const SetupTone = lazy(() => import('@/pages/feature/SetupTone'))
const Chat = lazy(() => import('@/pages/feature/Chat'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/verify-email',
    element: <EmailVerification />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/setup-tone',
    element: <SetupTone />,
  },
  {
    path: '/chat',
    element: <Chat />,
  },
]

export default routes
