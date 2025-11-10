import { Request, Response } from 'express'
import * as blogService from '@/services/blog.service'
import { User } from '@prisma/client'
import _ from 'lodash'
import catchAsync from '@/utils/catchAsync'

export const getRelatedBlogs = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const relatedBlogs = await blogService.getRelatedBlogs(id)
  res.json(relatedBlogs)
}

export const getRecentBlogs = async (req: Request, res: Response) => {
  const limit = req.query.limit
  const recentBlogs = await blogService.getRecentBlogs(Number(limit))
  res.json(recentBlogs)
}

export const listAllBlogs = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = req.query

    let sortBy = query.sortBy ?? 'createdAt'
    let sortType: 'asc' | 'desc' = 'desc'

    if (typeof sortBy === 'string' && sortBy.includes(':')) {
      const [field, direction] = sortBy.split(':')
      sortBy = field
      sortType = direction === 'asc' ? 'asc' : 'desc'
    }

    const options = {
      sortBy,
      sortType,
      limit: Number(query.limit ?? 12),
      page: Number(query.page ?? 1)
    }

    const filter = _.pick(query, ['title', 'tags', 'userId', 'createdAt'])

    const result = await blogService.queryBlogs(options, filter)
    res.json(result)
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

export const createBlog = catchAsync(async (req, res) => {
  const user = req.user as User
  const { title, content, tags } = req.body
  const image = req.file ? req.file : null

  if (!title || !content) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
  }

  try {
    const created = await blogService.createBlog(user.id, {
      title,
      content,
      image,
      tags
    })

    res.status(201).json(created)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
})

export const updateBlog = catchAsync(async (req, res) => {
  const user = req.user as User
  const id = parseInt(req.params.id)
  const { title, content, tags } = req.body
  const image = req.file ? req.file : null
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const updated = await blogService.updateBlog(user.id, id, { title, content, tags, image })
    res.json(updated)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
})

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
