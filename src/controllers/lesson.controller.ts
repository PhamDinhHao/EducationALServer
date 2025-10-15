import fs from 'fs'
import { Request, Response } from 'express'
import {
  createLessonService,
  deleteLessonService,
  generateActiveLearningLesson,
  generateIntegratedLesson,
  generateStandardLesson,
  generateSTEAMLesson,
  getLessonByIdService,
  getLessonsByCourseService,
  updateLessonService
} from '@services/lesson.service'

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
        lessonPlan = await generateStandardLesson(fileContent, grade, subject, topic, Number(periods))
        break
      case 'active':
        lessonPlan = await generateActiveLearningLesson(fileContent, grade, subject, topic, Number(periods))
        break
      case 'integrated':
        lessonPlan = await generateIntegratedLesson(fileContent, grade, subject, topic, Number(periods))
        break
      case 'steam':
        lessonPlan = await generateSTEAMLesson(fileContent, grade, subject, topic, Number(periods))
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

// Lấy bài học theo ID
// Lấy bài học theo ID
export const getLessonById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid lesson ID' })

  try {
    const lesson = await getLessonByIdService(id)
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
    const course = await getLessonsByCourseService(courseId)
    res.json(course)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

// Thêm bài học
export const createLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await createLessonService(req.body)
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
    const lesson = await updateLessonService(id, req.body)
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
    const result = await deleteLessonService(id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
