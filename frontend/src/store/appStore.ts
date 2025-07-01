import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createChatSlice } from './chatStore'
import { createUserSlice } from './userStore'
import type { AppStore } from '@/types/store'

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createChatSlice(...a),
        ...createUserSlice(...a),
      }),
      {
        name: 'app-storage',
        partialize: state => ({
          threads: state.threads,
          user: state.user,
        }),
      }
    ),
    {
      name: 'AppStore',
      serialize: {
        options: {
          function: false,
        },
      },
    }
  )
)
