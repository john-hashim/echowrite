import { RouteObject } from 'react-router-dom'
import { Login, Register } from '@/pages'
import Dashboard from '@/pages/dashboard/Dashboard'
import EmailVerification from '@/pages/auth/EmailVerification'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

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
    path: '/dashboard',
    element: <Dashboard />,
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
]

export default routes
