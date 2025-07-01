import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createChatSlice, ChatSlice } from './chatStore'
import { createUserSlice, UserSlice } from './userStore'

type AppStore = ChatSlice & UserSlice

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      set => ({
        ...createChatSlice(set),
        ...createUserSlice(set),
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
