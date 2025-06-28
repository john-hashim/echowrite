import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import * as chatService from '../services/chat.service'
import {
  sendMessageToChat,
  generateResponse,
  generateThreadTitle,
  initializeChatWithHistory,
  cleanupChatSession,
  sendMessageToChatStream,
} from '../services/gemini.service'

export const createThread = async (req: Request, res: Response): Promise<any> => {
  try {
    const { content, instruction } = req.body
    const user = req.user

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      })
    }

    // Generate AI response for the first message
    const aiResult = await generateResponse(content, instruction)

    if (!aiResult.success || !aiResult.data) {
      console.error('AI generation failed:', aiResult.error)

      const fallbackResponse =
        "I'm sorry, I'm having trouble responding right now. Please try again."
      const fallbackTitle = content.length > 30 ? content.substring(0, 30) + '...' : content

      const thread = await prisma.thread.create({
        data: {
          title: fallbackTitle,
          userId: user.id,
          message: {
            create: [
              { content, role: 'user' },
              { content: fallbackResponse, role: 'assistant' },
            ],
          },
        },
        include: {
          message: { orderBy: { createdAt: 'asc' } },
        },
      })

      return res.status(201).json({
        success: true,
        data: thread,
        message: 'Thread created with fallback response',
        warning: 'AI service temporarily unavailable',
      })
    }

    const aiResponse = aiResult.data

    // Generate thread title
    const titleResult = await generateThreadTitle(content)
    const threadTitle =
      titleResult.success && titleResult.data
        ? titleResult.data
        : content.length > 30
          ? content.substring(0, 30) + '...'
          : content

    // Create thread in database
    const thread = await prisma.thread.create({
      data: {
        title: threadTitle,
        userId: user.id,
        message: {
          create: [
            { content, role: 'user' },
            { content: aiResponse, role: 'assistant' },
          ],
        },
      },
      include: {
        message: { orderBy: { createdAt: 'asc' } },
      },
    })

    // Initialize chat session for future messages
    const messages = [
      { role: 'user' as const, content },
      { role: 'assistant' as const, content: aiResponse },
    ]
    await initializeChatWithHistory(thread.id, messages, instruction)

    return res.status(201).json({
      success: true,
      data: thread,
      message: 'Thread created successfully',
    })
  } catch (error) {
    console.error('Error creating thread:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create thread',
    })
  }
}

export const getThreads = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user

    const threads = await prisma.thread.findMany({
      where: {
        userId: user.id,
      },
      include: {
        message: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      data: threads,
      count: threads.length,
      message: 'Threads retrieved successfully',
    })
  } catch (error) {
    console.error('Error getting threads:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve threads',
      error: error,
    })
  }
}

export const getThread = async (req: Request, res: Response): Promise<any> => {
  try {
    const { threadId } = req.params
    const user = req.user

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: 'Thread ID is required',
      })
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId, userId: user.id },
      include: {
        message: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found or you do not have permission to access it',
      })
    }

    return res.status(200).json({
      success: true,
      data: thread,
      message: 'success',
    })
  } catch (error) {
    console.error('Error creating thread:', error)
    return res.status(500).json({
      success: false,
      message: 'Error in retriving thread',
    })
  }
}

export const addMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { content } = req.body
    const { threadId } = req.params

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is needed',
      })
    }

    // Add user message to database first
    const userResult = await chatService.addMessage(threadId, content, 'user')
    if (!userResult.success) {
      return res.status(400).json(userResult)
    }

    const thread = userResult.data

    // Check if we need to initialize chat session with history
    // This happens when the chat session doesn't exist (server restart, etc.)
    const messages = thread.message.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Initialize chat with history if this is the first API call for this thread
    if (messages.length <= 1) {
      // New conversation, use simple response
      await initializeChatWithHistory(threadId, [])
    } else {
      // Existing conversation, initialize with history minus the last message
      // (since we'll send it as the new message)
      const historyMessages = messages.slice(0, -1)
      await initializeChatWithHistory(threadId, historyMessages)
    }

    // Generate AI response using chat session
    const aiResult = await sendMessageToChat(threadId, content)

    if (!aiResult.success || !aiResult.data) {
      console.error('AI generation failed:', aiResult.error)

      // Add fallback message
      const fallbackMessage =
        "I'm having trouble responding right now. Could you please rephrase your message?"
      const fallbackResult = await chatService.addMessage(threadId, fallbackMessage, 'assistant')

      return res.status(200).json({
        success: true,
        data: fallbackResult.data,
        message: 'Message added with fallback response',
        warning: 'AI service temporarily unavailable',
      })
    }

    const aiResponse = aiResult.data

    // Add AI response to database
    const assistantResult = await chatService.addMessage(threadId, aiResponse, 'assistant')
    if (!assistantResult.success) {
      return res.status(500).json(assistantResult)
    }

    return res.status(200).json({
      success: true,
      data: assistantResult.data,
      message: 'Message added successfully',
    })
  } catch (error) {
    console.error('Error adding message:', error)
    return res.status(500).json({
      success: false,
      message: 'Error Adding Message',
    })
  }
}

export const updateThread = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title } = req.body
    const { threadId: id } = req.params
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Thread title is required',
      })
    }
    const thread = await prisma.thread.update({
      where: { id },
      data: { title },
    })

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found or you do not have permission to access it',
      })
    }

    return res.status(200).json({
      success: true,
      data: thread,
      message: 'Thread updated successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to update thread',
      error: error,
    })
  }
}

export const deleteThread = async (req: Request, res: Response): Promise<any> => {
  try {
    const { threadId } = req.params
    const user = req.user

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: 'Thread ID is required',
      })
    }

    const deletedThread = await prisma.thread.delete({
      where: {
        id: threadId,
        userId: user.id,
      },
    })

    return res.status(200).json({
      success: true,
      data: deletedThread,
      message: 'Thread deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting thread:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Thread not found or you do not have permission to delete it',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Unable to delete thread',
      error: error.message,
    })
  }
}
