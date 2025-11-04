import { Request, Response } from 'express'
import * as progressService from '../services/progress.service'

export const upsertProgress = async (req: Request, res: Response) => {
  const { userId, lessonId, progress, completedAt } = req.body
  if (!userId || !lessonId || progress === undefined) {
    return res.status(400).json({ message: 'Thiếu userId, lessonId hoặc progress' })
  }
  try {
    const updated = await progressService.upsertProgress(
      Number(userId),
      Number(lessonId),
      Number(progress),
      completedAt ? new Date(completedAt) : null
    )
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getLessonProgressForUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  const lessonId = parseInt(req.params.lessonId)
  if (isNaN(userId) || isNaN(lessonId)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const item = await progressService.getLessonProgressForUser(userId, lessonId)
    res.json(item)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const listProgressByCourseForUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  const courseId = parseInt(req.query.courseId as string)
  if (isNaN(userId)) return res.status(400).json({ message: 'ID không hợp lệ' })
  if (courseId && isNaN(courseId)) return res.status(400).json({ message: 'Course ID không hợp lệ' })
  
  try {
    if (courseId) {
      const items = await progressService.listProgressByCourseForUser(userId, courseId)
      res.json(items)
    } else {
      // Get all progress for user if no courseId
      const items = await progressService.getAllProgressForUser(userId)
      res.json(items)
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllProgress = async (_req: Request, res: Response) => {
  try {
    const progress = await progressService.getAllProgress()
    res.json(progress)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


