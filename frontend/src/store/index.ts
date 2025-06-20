// Export all store functionality
export * from './types'
export * from './userStore'
export * from './hooks'

// Main store exports for easy import
export { useUserStore } from './userStore'
export {
  useUser,
  useUserLoading,
  useUserError,
  useUserActions,
  useIsUserLoggedIn,
  useUserName,
  useUserEmail,
  useUserAvatar,
  useUserTone,
  useIsEmailVerified,
  useSetUserFromAuth,
} from './hooks'
