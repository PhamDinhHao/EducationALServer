import { Request, Response } from 'express'
import * as blogService from '@/services/blog.service'
import { User } from '@prisma/client'
import _ from 'lodash'
import catchAsync from '@utils/catchAsync'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'
import { uploadService } from '@/services'

export const uploadImage = catchAsync(async (req, res) => {
  const user = req.user as User
  const file = req.file
  if (!file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh' })
  }
  const url = await blogService.uploadBlogImage(user.id, file)
  res.json({ url })
})

export const heartBlog = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const hearted = await blogService.heartBlog(id)
  res.json(hearted)
})
export const getRelatedBlogs = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const type = req.query.type as 'BLOG' | 'CONTESTS' | undefined
  const relatedBlogs = await blogService.getRelatedBlogs(id, type)
  res.json(relatedBlogs)
}

export const getRecentBlogs = async (req: Request, res: Response) => {
  const limit = req.query.limit
  const type = req.query.type as 'BLOG' | 'CONTESTS'
  const recentBlogs = await blogService.getRecentBlogs(Number(limit), type)
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

    const filter = _.pick(query, ['title', 'tags', 'userId', 'createdAt', 'type', 'category'])
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
  const { title, content, tags, type, category } = req.body
  const image = req.file ? req.file : (req.body.image as string | null)

  if (!title || !content) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
  }

  try {
    const created = await blogService.createBlog(user.id, {
      title,
      content,
      image,
      tags,
      type,
      category
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
  const { title, content, tags, category } = req.body
  const image = req.file ? req.file : (req.body.image as string | null)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const updated = await blogService.updateBlog(user.id, id, { title, content, tags, image, category })
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
export const uploadBlogImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file provided');
  }

  const imageUrl = await uploadService.uploadImage('blogs', file.path);
  
  if (!imageUrl) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image');
  }

  res.status(200).json({
    success: true,
    data: { url: imageUrl },
    message: 'Image uploaded successfully'
  });
});
