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
