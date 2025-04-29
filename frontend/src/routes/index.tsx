import { RouteObject } from 'react-router-dom'
import { Login, Register } from '@/pages'
import Dashboard from '@/pages/dashboard/Dashboard'

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
  // Add more routes as needed
]

export default routes
