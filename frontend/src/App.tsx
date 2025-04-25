import { ThemeProvider } from '@/contexts/theme-provider'
import { ThemeToggle } from '@/components/common/theme-toggle'
import routes from './routes'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  const isAuthenticated = false

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        {/* Theme toggle positioned in top right corner */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? routes[0].element : <Navigate to="/login" replace />}
          />
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
