import { AxiosResponse } from 'axios'
import { UserResponse } from './auth'
import apiClient from '../index'
import { ENDPOINTS } from '../endpoints'

export interface Thread {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
  message?: Message[]
}

export interface Message {
  id: string
  threadId: string
  content: string
  role: Role
  createdAt: string
}

export enum Role {
  User = 'user',
  Assistant = 'assistant',
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  count?: number
}

export const featureService = {
  setupTone: (tone: string): Promise<AxiosResponse<{ message: string; user: UserResponse }>> => {
    return apiClient.post(ENDPOINTS.FEATURE.SET_TONE, { tone })
  },

  getThreads: (): Promise<AxiosResponse<ApiResponse<Thread[]>>> => {
    return apiClient.get(ENDPOINTS.FEATURE.GET_THREADS)
  },

  deleteThread: (threadId: string): Promise<AxiosResponse<ApiResponse<Thread[]>>> => {
    const URL = ENDPOINTS.FEATURE.DELETE_THREAD.replace(':threadID', threadId)
    return apiClient.delete(URL)
  },

  updateThread: (
    threadId: string,
    title: string
  ): Promise<AxiosResponse<ApiResponse<Thread[]>>> => {
    const URL = ENDPOINTS.FEATURE.UPDATE_THREAD.replace(':threadID', threadId)
    return apiClient.put(URL, { title })
  },
}
