import prisma from '@/client'

export const listCourseTypes = async () => {
  return prisma.courseType.findMany({ orderBy: { name: 'asc' } })
}

export const getCourseTypeById = async (id: number) => {
  return prisma.courseType.findUnique({ where: { id } })
}

export const createCourseType = async (input: { name: string; description?: string | null }) => {
  return prisma.courseType.create({ data: { name: input.name, description: input.description ?? null } })
}

export const updateCourseType = async (id: number, input: Partial<{ name: string; description?: string | null }>) => {
  return prisma.courseType.update({ where: { id }, data: input })
}

export const deleteCourseType = async (id: number) => {
  return prisma.courseType.delete({ where: { id } })
}


