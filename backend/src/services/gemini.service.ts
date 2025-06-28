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

    const prompt = `${instruction}

User: ${userMessage}

Please provide a helpful response.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    })
    console.log(response)
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
