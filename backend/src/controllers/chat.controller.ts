import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import * as chatService from '../services/chat.service'

export const createThread = async (req: Request, res: Response): Promise<any> => {
  try {
    const content = req.body.content
    const user = req.user
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      })
    }

    const random = Math.random()
    const aiMessage = {
      content: `new replay from ai ${random}`,
      title: `${random}`,
    }

    const thread = await prisma.thread.create({
      data: {
        title: aiMessage.title,
        userId: user.id,
        message: {
          create: {
            content,
            role: 'user',
          },
        },
      },
      include: {
        message: true,
      },
    })

    const result = await chatService.addMessage(thread.id, aiMessage.content, 'assistant')

    if (!result.success) {
      return res.status(500).json(result)
    }

    return res.status(201).json({
      success: true,
      data: result.data,
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

    const random = Math.random()
    const aiMessage = {
      content: `new replay from ai ${random}`,
    }

    const userResult = await chatService.addMessage(threadId, content, 'user')

    if (!userResult.success) {
      return res.status(400).json(userResult)
    }

    const assistantResult = await chatService.addMessage(threadId, aiMessage.content, 'assistant')

    if (!assistantResult.success) {
      return res.status(500).json(assistantResult)
    }

    return res.status(200).json({
      success: true,
      data: assistantResult.data,
      message: 'Message Added successfully',
    })
  } catch (error) {
    console.error('Error creating thread:', error)
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
