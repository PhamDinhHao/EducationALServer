import { Request, Response } from 'express'
import exerciseService from '@/services/exercise.service'
import fs from 'fs'

const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { function: func, prompt } = req.body
    const file = req.file

    let imageBase64: string | undefined

    if (file && file.path) {
      const buffer = fs.readFileSync(file.path)
      imageBase64 = buffer.toString('base64')
    }

    const answer = await exerciseService.generateAnswer(func, prompt, imageBase64)

    return res.json({ answer })
  } catch (error: any) {
    console.error('Error in chatWithAI:', error)
    return res.status(500).json({
      message: 'Lỗi khi gọi AI',
      error: error.message
    })
  }
}

export default { chatWithAI }
