import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authService } from '@/api/services/auth'
import { userService } from '@/api/services/user'
import { User, UserStore } from './types'

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: false,
        error: null,

        // Basic actions
        setUser: (user: User) => {
          set({ user, error: null }, false, 'user/setUser')
        },

        updateUser: (updates: Partial<User>) => {
          const currentUser = get().user
          if (currentUser) {
            set({ user: { ...currentUser, ...updates }, error: null }, false, 'user/updateUser')
          }
        },

        clearUser: () => {
          set({ user: null, error: null }, false, 'user/clearUser')
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading }, false, 'user/setLoading')
        },

        setError: (error: string | null) => {
          set({ error }, false, 'user/setError')
        },

        // Async actions
        fetchUser: async () => {
          try {
            set({ isLoading: true, error: null }, false, 'user/fetchUser/start')

            const response = await authService.getMe()
            const userData = response.data.user

            // Transform the API response to match our User interface
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name || null,
              avatar: userData.avatar || null,
              provider: userData.provider || null,
              emailVerified: userData.emailVerified || false,
              toneText: userData.toneText || null,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            }

            set({ user, isLoading: false, error: null }, false, 'user/fetchUser/success')
          } catch (error) {
            console.error('Failed to fetch user:', error)
            set(
              {
                isLoading: false,
                error: 'Failed to fetch user data',
                user: null,
              },
              false,
              'user/fetchUser/error'
            )
          }
        },

        updateUserTone: async (tone: string) => {
          try {
            set({ isLoading: true, error: null }, false, 'user/updateUserTone/start')

            // Call the API to update tone
            const response = await userService.updateTone(tone)
            const updatedUserData = response.data.user

            // Update the user in the store with the response data
            const currentUser = get().user
            if (currentUser) {
              const updatedUser: User = {
                ...currentUser,
                toneText: updatedUserData.toneText || null,
                updatedAt: updatedUserData.updatedAt || currentUser.updatedAt,
              }
              set(
                { user: updatedUser, isLoading: false, error: null },
                false,
                'user/updateUserTone/success'
              )
            }
          } catch (error) {
            console.error('Failed to update user tone:', error)
            set(
              {
                isLoading: false,
                error: 'Failed to update user tone',
              },
              false,
              'user/updateUserTone/error'
            )
            throw error // Re-throw so calling components can handle the error
          }
        },
      }),
      {
        name: 'user-store',
        // Only persist the user data, not loading states
        partialize: state => ({ user: state.user }),
        // Add version for migration support
        version: 1,
      }
    ),
    {
      name: 'EchoWrite User Store',
      // Enable detailed action tracking
      enabled: process.env.NODE_ENV === 'development',
      // Customize how actions appear in devtools
      serialize: {
        options: {
          undefined: true,
          function: true,
          symbol: true,
        },
      },
    }
  )
)
