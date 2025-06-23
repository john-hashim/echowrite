import { UserResponse } from '@/api/services/auth'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type State = {
  user: UserResponse | null
  isLoading: boolean
}

type Actions = {
  setUser: (user: UserResponse) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useUserStore = create<State & Actions>()(
  devtools(
    persist(
      set => ({
        user: null,
        isLoading: false,

        setUser: (user: UserResponse) => set({ user }, false, 'setUser'),
        clearUser: () => set({ user: null }, false, 'clearUser'),
        setLoading: (isLoading: boolean) => set({ isLoading }, false, 'setLoading'),
        logout: () => set({ user: null }, false, 'logout'),
      }),
      {
        name: 'user-storage',
        partialize: state => ({ user: state.user }),
      }
    ),
    {
      name: 'user-store',
      serialize: {
        options: {
          function: false,
        },
      },
    }
  )
)
