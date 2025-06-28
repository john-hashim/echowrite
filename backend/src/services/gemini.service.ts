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

const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }

  return new GoogleGenAI({ apiKey })
}

export const generateResponse = async (
  userMessage: string,
  systemInstruction?: string
): Promise<GeminiServiceResponse<string>> => {
  try {
    const ai = initializeGemini()

    const defaultInstruction =
      'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
    const instruction = systemInstruction || defaultInstruction

    const prompt = `${instruction}'

User: ${userMessage}

Please provide a helpful response.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
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

    const prompt = `Generate a short, descriptive title (maximum 3 words) for a conversation that starts with this message:

"${userMessage}"

Respond with only the title, no quotes or extra text.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    })

    let title = userMessage.split(' ')[0]
    if (response && response.text) {
      title = response.text.trim()
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

export const generateChatResponse = async (
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<GeminiServiceResponse<string>> => {
  try {
    const ai = initializeGemini()

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    if (systemInstruction) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `System: ${systemInstruction}` }],
      })
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents,
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
