import { AxiosResponse } from 'axios'
import { UserResponse } from '@/types/auth'
import apiClient from '../index'
import { ENDPOINTS } from '../endpoints'
import { ApiResponse, Thread } from '@/types/chat'

export const featureService = {
  setupTone: (tone: string): Promise<AxiosResponse<{ message: string; user: UserResponse }>> => {
    return apiClient.post(ENDPOINTS.FEATURE.SET_TONE, { tone })
  },

  getThreads: (): Promise<AxiosResponse<ApiResponse<Thread[]>>> => {
    return apiClient.get(ENDPOINTS.FEATURE.GET_THREADS)
  },

  getThread: (threadId: string): Promise<AxiosResponse<ApiResponse<Thread>>> => {
    const URL = ENDPOINTS.FEATURE.GET_THREAD.replace(':threadID', threadId)
    return apiClient.get(URL)
  },

  deleteThread: (threadId: string): Promise<AxiosResponse<ApiResponse<Thread>>> => {
    const URL = ENDPOINTS.FEATURE.DELETE_THREAD.replace(':threadID', threadId)
    return apiClient.delete(URL)
  },

  addMessage: (threadId: string, content: string): Promise<AxiosResponse<ApiResponse<Thread>>> => {
    const URL = ENDPOINTS.FEATURE.ADD_MESSAGE.replace(':threadID', threadId)
    return apiClient.post(URL, { content })
  },

  updateThread: (threadId: string, title: string): Promise<AxiosResponse<ApiResponse<Thread>>> => {
    const URL = ENDPOINTS.FEATURE.UPDATE_THREAD.replace(':threadID', threadId)
    return apiClient.put(URL, { title })
  },

  addThread: (content: string): Promise<AxiosResponse<ApiResponse<Thread>>> => {
    return apiClient.post(ENDPOINTS.FEATURE.ADD_NEW_THREAD, { content })
  },
}
