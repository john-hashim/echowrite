// src/api/services/user.ts
import { AxiosResponse } from 'axios'
import apiClient from '../index'
import { ENDPOINTS } from '../endpoints'

// User interfaces
export interface UpdateToneRequest {
  tone: string
}

export interface UpdateToneResponse {
  message: string
  user: {
    id: string
    email: string
    name?: string
    toneText?: string
    [key: string]: any
  }
}

export const userService = {
  /**
   * Update user tone
   * @param tone - The user's tone text
   * @returns Promise with updated user data
   */
  updateTone: (tone: string): Promise<AxiosResponse<UpdateToneResponse>> => {
    return apiClient.post(ENDPOINTS.USER.UPDATE_TONE, { tone })
  },
}
