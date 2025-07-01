import { Thread } from '@/types/chat'
import { AppStore, ChatSlice } from '@/types/store'
import { StateCreator } from 'zustand'

export const createChatSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never]],
  [],
  ChatSlice
> = set => ({
  threads: [],
  isLoading: false,
  error: null,

  setThreads: (threads: Thread[]) =>
    set(state => ({ ...state, threads, error: null }), false, 'setThreads'),
  setLoading: (isLoading: boolean) => set(state => ({ ...state, isLoading }), false, 'setLoading'),
  setError: (error: string | null) => set(state => ({ ...state, error }), false, 'setError'),
  clearError: () => set(state => ({ ...state, error: null }), false, 'clearError'),
  deleteThread: (threadId: string) =>
    set(state => ({ ...state, threads: state.threads.filter(threads => threads.id !== threadId) })),
})
