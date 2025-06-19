import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const updateUserToneHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user
    const { tone } = req.body

    if (!user || !user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!tone || typeof tone !== 'string') {
      return res.status(400).json({ message: 'Tone is required and must be a string' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { toneText: tone },
    })

    return res.json({ message: 'Tone updated successfully', user: updatedUser })
  } catch (error) {
    console.error('Error updating tone:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
