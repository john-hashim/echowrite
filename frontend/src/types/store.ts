import { UserResponse } from './auth'
import { Thread } from './chat'

export interface ChatSlice {
  threads: Thread[]
  isLoading: boolean
  error: string | null
  setThreads: (threads: Thread[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  deleteThread: (thread: string) => void
  updateThread: (thread: Thread) => void
  getThread: (threadId: string) => Thread | undefined
}

export interface UserSlice {
  user: UserResponse | null
  isLoading: boolean
  setUser: (user: UserResponse) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

// Combined store type
export type AppStore = ChatSlice & UserSlice
