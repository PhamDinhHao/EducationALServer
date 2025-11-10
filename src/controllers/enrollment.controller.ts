import { Request, Response } from 'express'
import * as enrollmentService from '../services/enrollment.service'

export const enroll = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const courseId = req.body.course_id || req.body.courseId
  if (!courseId) return res.status(400).json({ message: 'Thiếu courseId' })
  try {
    const result = await enrollmentService.enroll(user.id, Number(courseId))
    res.status(201).json(result)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const unenroll = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const courseId = req.body.course_id || req.body.courseId
  if (!courseId) return res.status(400).json({ message: 'Thiếu courseId' })
  try {
    await enrollmentService.unenroll(user.id, Number(courseId))
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

export const getMyEnrollments = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  try {
    const items = await enrollmentService.listUserEnrollments(user.id)
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const listAllEnrollments = async (_req: Request, res: Response) => {
  try {
    const enrollments = await enrollmentService.getAllEnrollments()
    res.json(enrollments)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const checkEnrollment = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const courseId = parseInt(req.params.courseId)
  if (isNaN(courseId)) return res.status(400).json({ message: 'ID khóa học không hợp lệ' })
  try {
    const result = await enrollmentService.checkEnrollment(user.id, courseId)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


