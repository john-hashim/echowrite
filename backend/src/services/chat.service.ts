import { prisma } from '../prisma/client'

interface ServiceResponse<T> {
  success: boolean
  data?: T
  message: string
  error?: string
}

export const addMessage = async (
  threadId: string,
  content: string,
  role: 'user' | 'assistant',
  title?: string
): Promise<ServiceResponse<any>> => {
  try {
    await prisma.message.create({
      data: { content, threadId, role },
    })

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        message: { orderBy: { createdAt: 'asc' } },
      },
    })

    return {
      success: true,
      data: thread,
      message: 'Message added successfully',
    }
  } catch (error) {
    throw new Error(`Failed to add message: ${error}`)
  }
}
