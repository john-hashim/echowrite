import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, rememberMe: boolean, userData?: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for token in localStorage or sessionStorage on initial load
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const hasToken = !!token
    setIsAuthenticated(hasToken)

    // If user is authenticated, fetch user data from API
    if (hasToken) {
      useUserStore
        .getState()
        .fetchUser()
        .catch(error => {
          console.error('Failed to fetch user data on app start:', error)
        })
    }

    setIsLoading(false)
  }, [])

  const login = (token: string, rememberMe: boolean, userData?: any) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
    setIsAuthenticated(true)

    // If user data is provided, set it in Zustand store
    if (userData) {
      useUserStore.getState().setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        avatar: userData.avatar || null,
        provider: userData.provider || null,
        emailVerified: userData.emailVerified || false,
        toneText: userData.toneText || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      })
    } else {
      // Fetch user data from API if not provided
      useUserStore
        .getState()
        .fetchUser()
        .catch(error => {
          console.error('Failed to fetch user data after login:', error)
        })
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setIsAuthenticated(false)
    useUserStore.getState().clearUser()
    navigate('/login')
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
