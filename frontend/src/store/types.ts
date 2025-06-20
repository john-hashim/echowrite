// Types for Zustand store
export interface User {
  id: string
  email: string
  name?: string | null
  avatar?: string | null
  provider?: string | null
  emailVerified: boolean
  toneText?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UserStore {
  // State
  user: User | null
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Async actions
  fetchUser: () => Promise<void>
  updateUserTone: (tone: string) => Promise<void>
}
