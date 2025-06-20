# Zustand Store Setup for User State Management

This project uses Zustand for managing user state alongside React Context for authentication. Here's how everything works together:

## 📁 Folder Structure

```
src/store/
├── index.ts          # Main exports
├── types.ts          # TypeScript interfaces
├── userStore.ts      # Main Zustand store
└── hooks.ts          # Selector hooks for performance
```

## 🔧 Architecture Overview

### useContext (AuthContext)

- Manages authentication state (isAuthenticated, token management)
- Handles login/logout functionality
- Persists tokens in localStorage/sessionStorage

### Zustand Store

- Manages user profile data after authentication
- Handles user-specific operations (updating tone, profile data)
- Persists user data across sessions
- Provides optimized selectors for performance

## 🚀 Usage Examples

### Basic Usage in Components

```tsx
import { useUser, useUserActions, useUserTone } from '@/store'

const MyComponent = () => {
  const user = useUser()
  const { updateUserTone } = useUserActions()
  const currentTone = useUserTone()

  // Component logic
}
```

### Available Hooks

#### Selector Hooks (Optimized)

```tsx
import {
  useUser, // Get full user object
  useUserName, // Get user name only
  useUserEmail, // Get user email only
  useUserTone, // Get user tone only
  useUserAvatar, // Get user avatar only
  useIsEmailVerified, // Get email verification status
  useIsUserLoggedIn, // Check if user is logged in
  useUserLoading, // Get loading state
  useUserError, // Get error state
} from '@/store'
```

#### Action Hooks

```tsx
import { useUserActions } from '@/store'

const {
  setUser, // Set user data
  updateUser, // Update specific user fields
  clearUser, // Clear user data
  fetchUser, // Fetch fresh user data from API
  updateUserTone, // Update user's writing tone
} = useUserActions()
```

## 🔄 Integration with Authentication Flow

### Login Process

1. User logs in via Login/Register/EmailVerification components
2. AuthContext receives token and sets isAuthenticated = true
3. AuthContext calls login() with user data
4. User data is automatically stored in Zustand store
5. If no user data provided, fetchUser() is called to get data from API

### Data Flow Example

```tsx
// In Login component
const response = await executeLogin(credentials)
if (response && response.token) {
  // This automatically populates Zustand store with user data
  login(response.token, formData.rememberMe, response.user)
  navigate('/chat')
}
```

## 📊 Store Features

### Persistence

- User data is persisted to localStorage automatically
- Only user data is persisted, not loading/error states
- Data survives browser refreshes and app restarts

### Error Handling

- Centralized error handling for user operations
- Errors are stored in the store and can be accessed via useUserError()
- Failed operations don't clear existing user data

### Loading States

- Loading states for async operations (fetchUser, updateUserTone)
- Accessible via useUserLoading() hook
- Prevents multiple simultaneous operations

## 🛠️ API Integration

### User Service

```tsx
// src/api/services/user.ts
export const userService = {
  updateTone: (tone: string) => apiClient.post('/user/tone', { tone }),
}
```

### Backend Endpoints Used

- `GET /auth/me` - Fetch user profile data
- `POST /user/tone` - Update user writing tone

## 📝 TypeScript Support

Full TypeScript support with interfaces:

```tsx
interface User {
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
```

## 🎯 Best Practices

### 1. Use Selector Hooks

Instead of accessing the whole store, use specific selectors:

```tsx
// ❌ Not optimal
const user = useUserStore()
const name = user.user?.name

// ✅ Optimal
const name = useUserName()
```

### 2. Handle Loading States

```tsx
const isLoading = useUserLoading()
const { updateUserTone } = useUserActions()

const handleUpdate = async () => {
  try {
    await updateUserTone(newTone)
    // Success handling
  } catch (error) {
    // Error is already stored in the store
  }
}

return (
  <Button disabled={isLoading}>
    {isLoading && <Spinner />}
    Update Tone
  </Button>
)
```

### 3. Check User Existence

```tsx
const user = useUser()

if (!user) {
  return <div>Please log in</div>
}

// Safe to use user data here
```

## 🔄 State Updates

### Automatic Updates

- Login/Register/EmailVerification automatically populate store
- API responses update the store automatically
- Logout clears the store automatically

### Manual Updates

```tsx
const { updateUser } = useUserActions()

// Update specific fields
updateUser({ name: 'New Name' })

// Fetch fresh data from API
await fetchUser()
```

## 🐛 Debugging

### Redux DevTools

The store is configured with Redux DevTools for debugging:

- Install Redux DevTools browser extension
- Inspect store state and actions in real-time
- View state changes with action names

### Console Logging

All async operations log errors to console:

```
Failed to fetch user: [error details]
Failed to update user tone: [error details]
```

## 🚨 Common Issues

### 1. User Data Not Persisting

- Check if localStorage is enabled in browser
- Verify store persistence configuration

### 2. TypeScript Errors

- Ensure all user data matches the User interface
- Check that API responses include expected fields

### 3. Stale Data

- Use fetchUser() to refresh data from API
- Store automatically updates on successful API calls

## 📱 Component Examples

See these components for implementation examples:

- `src/pages/onboarding/AddUserTone.tsx` - Full CRUD example
- `src/components/common/UserProfile.tsx` - Display user data
- `src/contexts/AuthContext.tsx` - Integration with auth

This setup provides a robust, type-safe, and performant state management solution for user data in your React application.
