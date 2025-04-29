import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, rememberMe: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token in localStorage or sessionStorage on initial load
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  const login = (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
