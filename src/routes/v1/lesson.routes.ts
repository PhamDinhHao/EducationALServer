import { Router } from 'express'
import * as lessonController from '../../controllers/lesson.controller'

const router = Router()

// Lấy tất cả bài học của 1 khoá học
// GET /lessons/course/:id
router.get('/course/:id', lessonController.getLessonsByCourse)
// lấy khoá học theo id
router.get('/:id', lessonController.getLessonById)

// Thêm bài học mới

// POST /lessons
router.post('/', lessonController.createLesson)

// Cập nhật bài học
// PUT /lessons/:id
router.put('/:id', lessonController.updateLesson)

// Xoá bài học
// DELETE /lessons/:id
router.delete('/:id', lessonController.deleteLesson)

export default router
