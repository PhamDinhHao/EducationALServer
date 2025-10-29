import { Request, Response } from 'express'
import * as courseTypeService from '../services/courseType.service'

export const listCourseTypes = async (_req: Request, res: Response) => {
  try {
    const items = await courseTypeService.listCourseTypes()
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getCourseTypeById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const item = await courseTypeService.getCourseTypeById(id)
    if (!item) return res.status(404).json({ message: 'Không tìm thấy loại khoá học' })
    res.json(item)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const createCourseType = async (req: Request, res: Response) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ message: 'Thiếu tên loại khoá học' })
  try {
    const created = await courseTypeService.createCourseType({ name, description })
    res.status(201).json(created)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const updateCourseType = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const updated = await courseTypeService.updateCourseType(id, req.body)
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteCourseType = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    await courseTypeService.deleteCourseType(id)
    res.status(204).send()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


