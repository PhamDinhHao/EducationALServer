import prisma from '@/client'

export const getAllBlogTags = async () => {
  return prisma.blogTag.findMany()
}

export const getBlogTagById = async (id: number) => {
  return prisma.blogTag.findUnique({ where: { id } })
}

export const createBlogTag = async (name: string) => {
  return prisma.blogTag.create({ data: { name, createdAt: new Date(), updatedAt: new Date() } })
}

export const updateBlogTag = async (
  id: number,
  input: Partial<{
    name: string
  }>
) => {
  return prisma.blogTag.update({ where: { id }, data: input })
}

export const deleteBlogTag = async (id: number) => {
  return prisma.blog.delete({ where: { id } })
}
