import { Request, Response } from 'express'
import * as courseService from '../services/course.service'

export const getCourses = async (req: Request, res: Response) => {
  const courses = await courseService.getAllCourses()
  res.json(courses)
}

export const getCourse = async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(Number(req.params.id))
  if (!course) return res.status(404).json({ message: 'Course not found' })
  res.json(course)
}

export const createCourse = async (req: Request, res: Response) => {
  const { title, description, img, url } = req.body
  const course = await courseService.createCourse({ title, description, img, url })
  res.status(201).json(course)
}

export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params
  const { title, description, img, url } = req.body
  const course = await courseService.updateCourse(Number(id), { title, description, img, url })
  res.json(course)
}

export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params
  await courseService.deleteCourse(Number(id))
  res.status(204).send()
}
