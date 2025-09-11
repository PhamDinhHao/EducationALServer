import { Request, Response } from 'express'
import * as lessonService from '../services/lesson.service'

// Lấy bài học theo ID
// Lấy bài học theo ID
export const getLessonById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid lesson ID' })

  try {
    const lesson = await lessonService.getLessonById(id)
    res.json(lesson)
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Lesson not found' })
  }
}

// Lấy bài học theo khoá học
export const getLessonsByCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id)
  if (isNaN(courseId)) return res.status(400).json({ message: 'Invalid course ID' })

  try {
    const course = await lessonService.getLessonsByCourse(courseId)
    res.json(course)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

// Thêm bài học
export const createLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await lessonService.createLesson(req.body)
    res.status(201).json(lesson)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Cập nhật bài học
export const updateLesson = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid lesson ID' })

  try {
    const lesson = await lessonService.updateLesson(id, req.body)
    res.json(lesson)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Xoá bài học
export const deleteLesson = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid lesson ID' })

  try {
    const result = await lessonService.deleteLesson(id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
