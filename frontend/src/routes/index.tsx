import { RouteObject } from 'react-router-dom'
import { Login, Register } from '@/pages'
import Dashboard from '@/pages/dashboard/Dashboard'
import EmailVerification from '@/pages/auth/EmailVerification'

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
    path: '/verify-email', // Page telling user to check email
    element: <EmailVerification />,
  },
  // Add more routes as needed
]

export default routes
