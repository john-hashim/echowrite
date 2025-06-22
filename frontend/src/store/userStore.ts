import { UserResponse } from '@/api/services/auth'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type State = {
  user: UserResponse | null
  isLoading: boolean
}

type Actions = {
  setUser: (user: UserResponse) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
}

type Action = {
  type: 'setUser' | 'clearUser' | 'setLoading'
  payload: UserResponse | null | boolean
}

const userReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setUser':
      return { ...state, user: action.payload as UserResponse }
    case 'clearUser':
      return { ...state, user: null }
    case 'setLoading':
      return { ...state, isLoading: action.payload as boolean }
    default:
      return state
  }
}

export const useUserStore = create<State & Actions>()(
  devtools(
    set => ({
      // Initial state
      user: null,
      isLoading: false,

      // Actions with better devtools integration
      setUser: (user: UserResponse) =>
        set(
          state => userReducer(state, { type: 'setUser', payload: user }),
          false, // Don't replace state, merge it
          'setUser' // Action name
        ),
      clearUser: () =>
        set(state => userReducer(state, { type: 'clearUser', payload: null }), false, 'clearUser'),
      setLoading: (isLoading: boolean) =>
        set(
          state => userReducer(state, { type: 'setLoading', payload: isLoading }),
          false,
          'setLoading'
        ),
    }),
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
