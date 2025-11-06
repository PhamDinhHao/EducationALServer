import { Request, Response } from 'express'
import * as blogService from '@/services/blog.service'
import { User } from '@prisma/client'

export const listAllBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await blogService.getAllBlogs()
    res.json(blogs)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}

export const getBlogById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const blog = await blogService.getBlogById(id)
    res.json(blog)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}

export const createBlog = async (req: Request, res: Response) => {
  const { title, content, image } = req.body
  if (!title || !content) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
  }
  try {
    const user = req.user as User
    const created = await blogService.createBlog(user.id, { userId: user.id, title, content, image })
    res.status(201).json(created)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}

export const updateBlog = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const updated = await blogService.updateBlog(id, req.body)
    res.json(updated)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}

export const deleteBlog = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    await blogService.deleteBlog(id)
    res.status(204).send()
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}
