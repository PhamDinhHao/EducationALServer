import prisma from '@/client'

export const getAllBlogs = async () => {
  return prisma.blog.findMany()
}

export const getBlogById = async (id: number) => {
  return prisma.blog.findUnique({ where: { id } })
}

export const createBlog = async (
  userId: number,
  input: {
    userId: number
    title: string
    content: string
    image?: string | null
  }
) => {
  return prisma.blog.create({ data: { ...input, userId } })
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
