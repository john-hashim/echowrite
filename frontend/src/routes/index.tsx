import { RouteObject } from 'react-router-dom'
import { Login, Register } from '@/pages'
import EmailVerification from '@/pages/auth/EmailVerification'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import ChatComponent from '@/pages/chat/Chat'
import SetupTone from '@/pages/onboarding/SetupTone'

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
    path: '/chat',
    element: <ChatComponent />,
  },
  {
    path: '/setup-tone',
    element: <SetupTone />,
  },
]

export default routes
