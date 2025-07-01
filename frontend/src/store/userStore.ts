import { UserResponse } from '@/api/services/auth'

export interface UserSlice {
  user: UserResponse | null
  isLoading: boolean
  setUser: (user: UserResponse) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const createUserSlice = (set: any): UserSlice => ({
  user: null,
  isLoading: false,

  setUser: (user: UserResponse) => set((state: any) => ({ ...state, user }), false, 'setUser'),
  clearUser: () => set((state: any) => ({ ...state, user: null }), false, 'clearUser'),
  setLoading: (isLoading: boolean) =>
    set((state: any) => ({ ...state, isLoading }), false, 'setLoading'),
  logout: () => set((state: any) => ({ ...state, user: null }), false, 'logout'),
})
