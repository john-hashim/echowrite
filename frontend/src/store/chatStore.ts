import { Thread } from '@/api/services/feature'

export interface ChatSlice {
  threads: Thread[]
  isLoading: boolean
  error: string | null
  setThreads: (threads: Thread[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const createChatSlice = (set: any): ChatSlice => ({
  threads: [],
  isLoading: false,
  error: null,

  setThreads: (threads: Thread[]) =>
    set((state: any) => ({ ...state, threads, error: null }), false, 'setThreads'),
  setLoading: (isLoading: boolean) =>
    set((state: any) => ({ ...state, isLoading }), false, 'setLoading'),
  setError: (error: string | null) => set((state: any) => ({ ...state, error }), false, 'setError'),
  clearError: () => set((state: any) => ({ ...state, error: null }), false, 'clearError'),
})
