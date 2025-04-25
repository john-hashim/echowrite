import { RouteObject } from 'react-router-dom'
import { Login, Register } from '../pages'

// eslint-disable-next-line react-refresh/only-export-components
const Home = () => <div>Home Page</div>

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  // Add more routes as needed
]

export default routes
