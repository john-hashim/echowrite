import { AxiosResponse } from 'axios'
import { UserResponse } from './auth'
import apiClient from '../index'
import { ENDPOINTS } from '../endpoints'

export const featureService = {
  setupTone: (tone: string): Promise<AxiosResponse<{ message: string; user: UserResponse }>> => {
    return apiClient.post(ENDPOINTS.FEATURE.SET_TONE, { tone })
  },
}
