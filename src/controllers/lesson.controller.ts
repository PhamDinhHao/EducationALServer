import { Request, Response } from 'express'
import * as lessonService from '../services/lesson.service'
import fs from 'fs'

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

export const generateLesson = async (req: Request, res: Response) => {
  try {
    const { grade, subject, topic, periods, lessonType } = req.body
    const file = req.file // file upload từ multer

    // Nếu có file thì đọc nội dung, không thì để undefined
    let fileContent: string | undefined = undefined
    if (file) {
      try {
        fileContent = fs.readFileSync(file.path, 'utf-8')
      } catch (err) {
        console.error('Không đọc được file:', err)
      }
    }

    let lessonPlan
    switch (lessonType) {
      case 'standard':
        lessonPlan = await lessonService.generateStandardLesson(fileContent, grade, subject, topic, Number(periods))
        break
      case 'active':
        lessonPlan = await lessonService.generateActiveLearningLesson(fileContent, grade, subject, topic, Number(periods))
        break
      case 'integrated':
        lessonPlan = await lessonService.generateIntegratedLesson(fileContent, grade, subject, topic, Number(periods))
        break
      case 'steam':
        lessonPlan = await lessonService.generateSTEAMLesson(fileContent, grade, subject, topic, Number(periods))
        break
      default:
        return res.status(400).json({ message: 'Loại giáo án không hợp lệ' })
    }

    res.json({ data: lessonPlan })
  } catch (error: any) {
    console.error('Error generating lesson:', error)
    res.status(500).json({ message: 'Lỗi khi tạo giáo án', error: error.message })
  }
}
