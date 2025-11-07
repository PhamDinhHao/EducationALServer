import prisma from '@/client'

export const queryBlogs = async (options: { limit?: number; page?: number; sortBy?: string; sortType?: 'asc' | 'desc' }, filter: { title?: string; tags?: string; userId?: number }) => {
  const page = Number(options.page ?? 1)
  const limit = Number(options.limit ?? 12)
  const sortBy = options.sortBy ?? 'createdAt'
  const sortType = options.sortType ?? 'desc'

  const total = await prisma.blog.count()

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
        : {})
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

export const getRelatedBlogs = async (id: number) => {
  const currentBlog = await prisma.blog.findUnique({
    where: { id },
    include: { tags: true }
  })

  if (!currentBlog || currentBlog.tags.length === 0) {
    return prisma.blog.findMany({
      where: { id: { not: id } },
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
      }
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

export const getRecentBlogs = async () => {
  return prisma.blog.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 3
  })
}
export const getBlogById = async (id: number) => {
  return prisma.blog.findUnique({ where: { id }, include: { tags: true, user: true, comments: true } })
}

export const createBlog = async (
  userId: number,
  input: {
    title: string
    content: string
    image?: string | null
    tags?: string | null
  }
) => {
  const tagsArray = input.tags?.split(',').map((t) => t.trim())
  return prisma.blog.create({
    data: {
      userId,
      title: input.title,
      content: input.content,
      image: input.image,
      tags: {
        connectOrCreate: tagsArray?.map((t) => ({
          where: { name: t },
          create: { name: t }
        }))
      }
    },
    include: {
      tags: true
    }
  })
}

export const updateBlog = async (
  id: number,
  input: Partial<{
    title: string
    content: string
    image: string
  }>
) => {
  return prisma.blog.update({ where: { id }, data: input })
}

export const deleteBlog = async (id: number) => {
  return prisma.blog.delete({ where: { id } })
}
