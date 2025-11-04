import { Request, Response } from 'express'
import * as lessonService from '../services/lesson.service'

export const listAllLessons = async (_req: Request, res: Response) => {
  try {
    const lessons = await lessonService.getAllLessons()
    res.json(lessons)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getLessonsByCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id)
  if (isNaN(courseId)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const lessons = await lessonService.getLessonsByCourse(courseId)
    res.json(lessons)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getLessonById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const lesson = await lessonService.getLessonById(id)
    if (!lesson) return res.status(404).json({ message: 'Không tìm thấy bài học' })
    res.json(lesson)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const createLesson = async (req: Request, res: Response) => {
  const { title, description, duration, src, order, courseId } = req.body
  if (!title || !description || !duration || !src || order === undefined || !courseId) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
  }
  try {
    const created = await lessonService.createLesson({
      title,
      description,
      duration: Number(duration),
      src,
      order: Number(order),
      courseId: Number(courseId)
    })
    res.status(201).json(created)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const updateLesson = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const updated = await lessonService.updateLesson(id, req.body)
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteLesson = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    await lessonService.deleteLesson(id)
    res.status(204).send()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


