import { Request, Response } from 'express'
import * as enrollmentService from '../services/enrollment.service'

export const enroll = async (req: Request, res: Response) => {
  const { userId, courseId } = req.body
  if (!userId || !courseId) return res.status(400).json({ message: 'Thiếu userId hoặc courseId' })
  try {
    const result = await enrollmentService.enroll(Number(userId), Number(courseId))
    res.status(201).json(result)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const unenroll = async (req: Request, res: Response) => {
  const { userId, courseId } = req.body
  if (!userId || !courseId) return res.status(400).json({ message: 'Thiếu userId hoặc courseId' })
  try {
    await enrollmentService.unenroll(Number(userId), Number(courseId))
    res.status(204).send()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const listUserEnrollments = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  if (isNaN(userId)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const items = await enrollmentService.listUserEnrollments(userId)
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


