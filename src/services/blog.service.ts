import prisma from '@/client'
import assetService from '@/services/asset.service'
import path from 'path'
import fs from 'fs'

export const heartBlog = async (id: number) => {
  return prisma.blog.update({ where: { id }, data: { hearts: { increment: 1 } } })
}
export const queryBlogs = async (
  options: { limit?: number; page?: number; sortBy?: string; sortType?: 'asc' | 'desc' },
  filter: { title?: string; tags?: string; userId?: number; type?: 'BLOG' | 'CONTESTS'; category?: 'STUDENT' | 'TEACHER' | 'MANAGEMENT_STAFF' | 'NEW_TECHNOLOGY' }
) => {
  const page = Number(options.page ?? 1)
  const limit = Number(options.limit ?? 12)
  const sortBy = options.sortBy ?? 'createdAt'
  const sortType = options.sortType ?? 'desc'

  const blogs = await prisma.blog.findMany({
    include: { tags: true },
    skip: (page - 1) * limit,
    take: limit, // ✅ đảm bảo là số
    orderBy: { [sortBy]: sortType }, // ✅ cú pháp động hợp lệ
    where: {
      ...(filter.title ? { title: { contains: filter.title } } : {}),
      ...(filter.userId ? { userId: filter.userId } : {}),
      ...(filter.tags
        ? {
            tags: {
              some: {
                name: {
                  in: filter.tags.split(',').map((t) => t.trim())
                }
              }
            }
          }
        : {}),
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.category ? { category: filter.category } : {})
    }
  })
  const total = await prisma.blog.count({
    where: {
      ...(filter.title ? { title: { contains: filter.title } } : {}),
      ...(filter.userId ? { userId: filter.userId } : {}),
      ...(filter.tags
        ? {
            tags: {
              some: {
                name: {
                  in: filter.tags.split(',').map((t) => t.trim())
                }
              }
            }
          }
        : {}),
      ...(filter.type ? { type: filter.type } : {})
    }
  })

  const totalPages = Math.ceil(total / limit)

  return {
    data: blogs,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  }
}

export const getRelatedBlogs = async (id: number, type?: 'BLOG' | 'CONTESTS') => {
  const currentBlog = await prisma.blog.findUnique({
    where: { id, ...(type ? { type: type } : {}) },
    include: { tags: true }
  })

  if (!currentBlog || currentBlog.tags.length === 0) {
    return prisma.blog.findMany({
      where: { id: { not: id }, ...(type ? { type: type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  }

  const tagIds = currentBlog.tags.map((t) => t.id)

  return prisma.blog.findMany({
    where: {
      id: { not: id },
      tags: {
        some: {
          id: { in: tagIds }
        }
      },
      ...(type ? { type: type } : {})
    },
    include: {
      tags: true,
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3
  })
}

export const getRecentBlogs = async (limit?: number, type?: 'BLOG' | 'CONTESTS') => {
  const safeLimit = Math.min(limit ?? 3, 20)

  return prisma.blog.findMany({
    where: type ? { type: type as 'BLOG' | 'CONTESTS' } : {},
    orderBy: { createdAt: 'desc' },
    take: safeLimit
  })
}

export const getBlogById = async (id: number) => {
  return prisma.blog.findUnique({ where: { id }, include: { tags: true, user: true, comments: true } })
}

const extractBase64Images = (html: string) => {
  const regex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g
  const matches = [...html.matchAll(regex)]
  return matches.map((m) => ({
    fullMatch: m[0],
    mimeType: m[1],
    base64Data: m[2]
  }))
}
const uploadBase64Images = async (userId: number, images: { base64Data: string; mimeType: string }[]) => {
  const uploadedUrls: string[] = []

  for (const img of images) {
    const buffer = Buffer.from(img.base64Data, 'base64')
    const filename = `base64-${Date.now()}-${Math.random().toString(36).slice(2)}.${img.mimeType.split('/')[1]}`
    const filepath = path.join('tmp', 'uploads', filename)

    // ✳️ Lưu file tạm thật
    fs.writeFileSync(filepath, new Uint8Array(buffer))
    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: `image/${img.mimeType}`,
      size: buffer.length,
      destination: 'tmp/uploads',
      filename,
      path: filepath,
      buffer: buffer,
      stream: undefined as any
    }

    const uploaded = await assetService.uploadImage(userId, [fakeFile])
    uploadedUrls.push(uploaded[0].src)

    // ✅ Xóa file tạm sau upload
    fs.unlinkSync(filepath)
  }

  return uploadedUrls
}
const replaceImagesInContent = (html: string, base64Images: any[], urls: string[]) => {
  let newContent = html
  base64Images.forEach((img, i) => {
    newContent = newContent.replace(img.fullMatch, `<img src="${urls[i]}" />`)
  })
  return newContent
}

export const createBlog = async (
  userId: number,
  input: {
    title: string
    content: string
    image?: Express.Multer.File | string | null
    tags?: string | null
    type?: 'BLOG' | 'CONTESTS'
    category?: 'STUDENT' | 'TEACHER' | 'MANAGEMENT_STAFF' | 'NEW_TECHNOLOGY'
  }
) => {
  // 1. Xử lý ảnh trong content
  const base64Images = extractBase64Images(input.content)
  const uploadedUrls = await uploadBase64Images(userId, base64Images)
  const cleanContent = replaceImagesInContent(input.content, base64Images, uploadedUrls)

  // 2. Xử lý ảnh thumbnail chính (nếu có)
  let imageSrc: string | null = null
  if (input.image) {
    if (typeof input.image === 'string') {
      imageSrc = input.image
    } else {
      const uploaded = await assetService.uploadImage(userId, [input.image])
      imageSrc = uploaded[0].src
    }
  }

  // 3. Xử lý tags
  const tagsArray = input.tags?.split(',').map((t) => t.trim())

  // 4. Lưu vào DB
  return prisma.blog.create({
    data: {
      userId,
      title: input.title,
      content: cleanContent, // content đã thay link ảnh thật
      image: imageSrc,
      tags: {
        connectOrCreate: tagsArray?.map((t) => ({
          where: { name: t },
          create: { name: t }
        }))
      },
      type: input.type,
      category: input.category
    },
    include: {
      tags: true
    }
  })
}

export const updateBlog = async (
  userId: number,
  id: number,
  input: {
    title: string
    content: string
    image?: Express.Multer.File | string | null
    tags?: string | null
    category?: 'STUDENT' | 'TEACHER' | 'MANAGEMENT_STAFF' | 'NEW_TECHNOLOGY'
  }
) => {
  const tagsArray = input.tags?.split(',').map((t) => t.trim())
  
  let imageSrc: string | undefined = undefined
  if (input.image) {
    if (typeof input.image === 'string') {
      imageSrc = input.image
    } else {
      const uploaded = await assetService.uploadImage(userId, [input.image])
      imageSrc = uploaded[0].src
    }
  }

  return prisma.blog.update({
    where: { id },
    data: {
      title: input.title,
      content: input.content,
      image: imageSrc,
      tags: {
        connectOrCreate:
          tagsArray?.map((t) => ({
            where: { name: t },
            create: { name: t }
          })) ?? []
      },
      category: input.category
    }
  })
}

export const deleteBlog = async (id: number) => {
  return prisma.blog.delete({ where: { id } })
}

export const uploadBlogImage = async (userId: number, file: Express.Multer.File) => {
  const uploaded = await assetService.uploadImage(userId, [file])
  return uploaded[0].src
}
