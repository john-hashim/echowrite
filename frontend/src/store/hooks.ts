import { useCallback } from 'react'
import { useUserStore } from './userStore'
import { User } from './types'

// Selector hooks for better performance - using shallow comparison
export const useUser = () => useUserStore(state => state.user)
export const useUserLoading = () => useUserStore(state => state.isLoading)
export const useUserError = () => useUserStore(state => state.error)

// Action hooks - memoized to prevent re-renders
export const useUserActions = () =>
  useUserStore(
    useCallback(
      state => ({
        setUser: state.setUser,
        updateUser: state.updateUser,
        clearUser: state.clearUser,
        setLoading: state.setLoading,
        setError: state.setError,
        fetchUser: state.fetchUser,
        updateUserTone: state.updateUserTone,
      }),
      []
    )
  )

// Computed selectors with stable references
export const useIsUserLoggedIn = () => useUserStore(state => !!state.user)
export const useUserName = () => useUserStore(state => state.user?.name || '')
export const useUserEmail = () => useUserStore(state => state.user?.email || '')
export const useUserAvatar = () => useUserStore(state => state.user?.avatar || null)
export const useUserTone = () => useUserStore(state => state.user?.toneText || null)
export const useIsEmailVerified = () => useUserStore(state => state.user?.emailVerified || false)

// Helper hook to set user data from auth responses
export const useSetUserFromAuth = () => {
  const { setUser } = useUserActions()

  return useCallback(
    (authUser: any) => {
      const user: User = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name || null,
        avatar: authUser.avatar || null,
        provider: authUser.provider || null,
        emailVerified: authUser.emailVerified || false,
        toneText: authUser.toneText || null,
        createdAt: authUser.createdAt,
        updatedAt: authUser.updatedAt,
      }
      setUser(user)
    },
    [setUser]
  )
}
