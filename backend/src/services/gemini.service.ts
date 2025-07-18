import { GoogleGenAI } from '@google/genai'

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

// Store active chat sessions in memory (consider Redis for production)
const activeChatSessions = new Map<string, any>()

const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }

  return new GoogleGenAI({ apiKey })
}

// Create or get existing chat session for a thread
export const getOrCreateChatSession = (threadId: string, systemInstruction?: string) => {
  const ai = initializeGemini()

  // Check if chat session already exists
  if (activeChatSessions.has(threadId)) {
    return activeChatSessions.get(threadId)
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

  // Store in memory
  activeChatSessions.set(threadId, chat)
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
    history, // This initializes the chat with conversation history
  })

  // Store in memory
  activeChatSessions.set(threadId, chat)
  return chat
}

// Send message using existing chat session
export const sendMessageToChat = async (
  threadId: string,
  message: string
): Promise<GeminiServiceResponse<string>> => {
  try {
    let chat = activeChatSessions.get(threadId)

    if (!chat) {
      // If no active session, create a new one
      chat = getOrCreateChatSession(threadId)
    }

    const response = await chat.sendMessage({
      message: message,
    })

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
    let chat = activeChatSessions.get(threadId)

    if (!chat) {
      chat = getOrCreateChatSession(threadId)
    }

    const responseStream = await chat.sendMessageStream({
      message: message,
    })

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
