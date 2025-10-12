import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'

import aiService, { ChatMessage, ImageFile } from '@/services/ai.service'

const generateWithMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, subject, imageFile, image_file } = req.body as {
      messages: ChatMessage[]
      subject?: string
      imageFile?: { mimeType: string; base64Data: string }
      image_file?: { mimeType: string; base64Data: string } | { mime_type: string; data: string }
    }

    if (!messages || messages.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'messages is required' })
    }

    let imageFileData: ImageFile | undefined
    const imgData = imageFile || image_file
    if (imgData) {
      const anyImg = imgData as any
      imageFileData = {
        mimeType: anyImg.mimeType || anyImg.mime_type,
        base64Data: anyImg.base64Data || anyImg.base64_data || anyImg.data
      }
    }

    const result = await aiService.makeRequest(messages, subject || 'môn học', imageFileData)
    return res.status(httpStatus.OK).json({ success: true, data: { result } })
  } catch (error) {
    return next(error)
  }
}

const generateText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body as { prompt: string }
    if (!prompt) return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'prompt is required' })

    console.log('🔹 Generating text with prompt length:', prompt.length)
    const result = await aiService.generateText(prompt)
    console.log('✅ Text generation successful, result length:', result.length)

    return res.status(httpStatus.OK).json({ success: true, data: { result } })
  } catch (error) {
    console.error('❌ Text generation failed:', error)
    return next(error)
  }
}

export default { generateWithMessages, generateText }
