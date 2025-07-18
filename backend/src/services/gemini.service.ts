import { GoogleGenAI } from '@google/genai'
import Redis from 'ioredis'

export interface GeminiServiceResponse<T> {
  success: boolean
  data?: T
  message: string
  error?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SerializedChatSession {
  threadId: string
  history: any[]
  systemInstruction?: string
  createdAt: number
  lastUsed: number
}

// Redis client initialization
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 50,
  tls: {},
})

// Redis key prefix for chat sessions
const CHAT_SESSION_PREFIX = 'chat_session:'
const SESSION_EXPIRY = 60 * 60 * 24 * 7

const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }

  return new GoogleGenAI({ apiKey })
}

// Helper function to serialize chat session data for Redis
const serializeChatSession = (
  threadId: string,
  history: any[],
  systemInstruction?: string
): SerializedChatSession => {
  return {
    threadId,
    history,
    systemInstruction,
    createdAt: Date.now(),
    lastUsed: Date.now(),
  }
}

// Helper function to recreate chat session from Redis data
const recreateChatSession = (sessionData: SerializedChatSession) => {
  const ai = initializeGemini()

  const defaultInstruction =
    'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
  const instruction = sessionData.systemInstruction || defaultInstruction

  const chat = ai.chats.create({
    model: 'gemini-2.0-flash-001',
    config: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      systemInstruction: {
        role: 'system',
        parts: [{ text: instruction }],
      },
    },
    history: sessionData.history,
  })

  return chat
}

// Store chat session in Redis
const storeChatSession = async (
  threadId: string,
  chat: any,
  systemInstruction?: string
): Promise<void> => {
  try {
    const history = chat.getHistory ? chat.getHistory() : []
    const sessionData = serializeChatSession(threadId, history, systemInstruction)

    await redis.setex(
      `${CHAT_SESSION_PREFIX}${threadId}`,
      SESSION_EXPIRY,
      JSON.stringify(sessionData)
    )
  } catch (error) {
    console.error('Error storing chat session in Redis:', error)
  }
}

// Retrieve chat session from Redis
const retrieveChatSession = async (threadId: string): Promise<any | null> => {
  try {
    const sessionDataStr = await redis.get(`${CHAT_SESSION_PREFIX}${threadId}`)

    if (!sessionDataStr) {
      return null
    }

    const sessionData: SerializedChatSession = JSON.parse(sessionDataStr)
    // Update last used timestamp
    sessionData.lastUsed = Date.now()
    await redis.setex(
      `${CHAT_SESSION_PREFIX}${threadId}`,
      SESSION_EXPIRY,
      JSON.stringify(sessionData)
    )

    return recreateChatSession(sessionData)
  } catch (error) {
    console.error('Error retrieving chat session from Redis:', error)
    return null
  }
}

// Create or get existing chat session for a thread
export const getOrCreateChatSession = async (threadId: string, systemInstruction?: string) => {
  const ai = initializeGemini()

  // Check if chat session exists in Redis
  const existingChat = await retrieveChatSession(threadId)
  if (existingChat) {
    return existingChat
  }

  const defaultInstruction =
    'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
  const instruction = systemInstruction || defaultInstruction

  // Create new chat session
  const chat = ai.chats.create({
    model: 'gemini-2.0-flash-001',
    config: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      systemInstruction: {
        role: 'system',
        parts: [{ text: instruction }],
      },
    },
  })

  // Store in Redis
  await storeChatSession(threadId, chat, systemInstruction)
  return chat
}

// Initialize chat session with existing conversation history
export const initializeChatWithHistory = async (
  threadId: string,
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<any> => {
  const ai = initializeGemini()

  const defaultInstruction =
    'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
  const instruction = systemInstruction || defaultInstruction

  // Convert your message format to Gemini format
  const history = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  // Create chat with history
  const chat = ai.chats.create({
    model: 'gemini-2.0-flash-001',
    config: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      systemInstruction: {
        role: 'system',
        parts: [{ text: instruction }],
      },
    },
    history,
  })

  // Store in Redis
  await storeChatSession(threadId, chat, systemInstruction)
  return chat
}

// Send message using existing chat session
export const sendMessageToChat = async (
  threadId: string,
  message: string
): Promise<GeminiServiceResponse<string>> => {
  try {
    let chat = await retrieveChatSession(threadId)

    if (!chat) {
      // If no active session, create a new one
      chat = await getOrCreateChatSession(threadId)
    }

    const response = await chat.sendMessage({
      message: message,
    })

    // Update the session in Redis after sending message
    await storeChatSession(threadId, chat)

    return {
      success: true,
      data: response.text,
      message: 'Chat response generated successfully',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate chat response',
      error: `Gemini AI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Stream response for better UX
export const sendMessageToChatStream = async (
  threadId: string,
  message: string
): Promise<AsyncGenerator<string, void, unknown> | null> => {
  try {
    let chat = await retrieveChatSession(threadId)

    if (!chat) {
      chat = await getOrCreateChatSession(threadId)
    }

    const responseStream = await chat.sendMessageStream({
      message: message,
    })

    // Update the session in Redis after streaming
    await storeChatSession(threadId, chat)

    return responseStream
  } catch (error) {
    console.error('Streaming error:', error)
    return null
  }
}

// Original functions kept for backward compatibility
export const generateResponse = async (
  userMessage: string,
  systemInstruction?: string
): Promise<GeminiServiceResponse<string>> => {
  try {
    const ai = initializeGemini()

    const defaultInstruction =
      'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
    const instruction = systemInstruction || defaultInstruction

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${instruction}\n\nUser: ${userMessage}\n\nPlease provide a helpful response.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    })

    return {
      success: true,
      data: response.text,
      message: 'AI response generated successfully',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate AI response',
      error: `Gemini AI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export const generateThreadTitle = async (
  userMessage: string
): Promise<GeminiServiceResponse<string>> => {
  try {
    const ai = initializeGemini()

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a short, descriptive title (maximum 5 words) for a conversation that starts with this message: "${userMessage}"\n\nRespond with only the title, no quotes or extra text.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 50,
      },
    })

    let title = userMessage.split(' ').slice(0, 3).join(' ')
    if (response && response.text) {
      title = response.text.trim().replace(/['"]/g, '')
    }

    return {
      success: true,
      data: title,
      message: 'Thread title generated successfully',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate thread title',
      error: `Gemini AI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Redis connection health check
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis connection failed:', error)
    return false
  }
}

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redis.quit()
  } catch (error) {
    console.error('Error closing Redis connection:', error)
  }
}
