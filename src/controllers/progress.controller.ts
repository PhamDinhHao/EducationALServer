import { Request, Response } from 'express'
import * as progressService from '../services/progress.service'

export const upsertProgress = async (req: Request, res: Response) => {
  const user = req.user as { id: number } | undefined
  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const lessonId = Number(req.body.lesson_id || req.body.lessonId)
  const progress = Number(req.body.progress)
  const completedAt = req.body.completed_at || req.body.completedAt

  if (!lessonId || isNaN(lessonId) || progress === undefined || isNaN(progress)) {
    return res.status(400).json({ message: 'Thiếu lessonId hoặc progress' })
  }

  try {
    const updated = await progressService.upsertProgress(
      user.id,
      lessonId,
      progress,
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
  const courseId = parseInt((req.query.course_id as string) || (req.query.courseId as string))
  if (isNaN(userId)) return res.status(400).json({ message: 'ID không hợp lệ' })
  if (courseId && isNaN(courseId)) return res.status(400).json({ message: 'Course ID không hợp lệ' })

  try {
    if (courseId) {
      const items = await progressService.listProgressByCourseForUser(userId, courseId)
      res.json(items)
    } else {
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

export const getMyProgressByCourse = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const courseId = parseInt((req.query.course_id as string) || (req.query.courseId as string))
  if (isNaN(courseId)) return res.status(400).json({ message: 'Course ID không hợp lệ' })

  try {
    const items = await progressService.listProgressByCourseForUser(user.id, courseId)
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyLessonProgress = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const lessonId = parseInt(req.params.lessonId)
  if (isNaN(lessonId)) return res.status(400).json({ message: 'Lesson ID không hợp lệ' })

  try {
    const progress = await progressService.getLessonProgressForUser(user.id, lessonId)
    if (!progress) {
      return res.json({ progress: 0, completedAt: null })
    }
    res.json({ progress: progress.progress, completedAt: progress.completedAt })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


