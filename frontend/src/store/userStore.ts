import { StateCreator } from 'zustand'
import type { AppStore, UserSlice } from '@/types/store'
import { UserResponse } from '@/types/auth'

export const createUserSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never]],
  [],
  UserSlice
> = set => ({
  user: null,
  isLoading: false,

  setUser: (user: UserResponse) => set(state => ({ ...state, user }), false, 'setUser'),
  clearUser: () => set(state => ({ ...state, user: null }), false, 'clearUser'),
  setLoading: (isLoading: boolean) => set(state => ({ ...state, isLoading }), false, 'setLoading'),
  logout: () => set(state => ({ ...state, user: null, threads: [] }), false, 'logout'),
})
