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

export const getTopCategories = async (limit: number = 8) => {
  const courseCounts = await prisma.course.groupBy({
    by: ['courseTypeId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  })

  const courseTypeIds = courseCounts.map((item) => item.courseTypeId)

  const courseTypes = await prisma.courseType.findMany({
    where: { id: { in: courseTypeIds } },
  })

  return courseTypes
    .map((ct) => ({
      ...ct,
      courseCount: courseCounts.find((cc) => cc.courseTypeId === ct.id)?._count.id || 0,
    }))
    .sort((a, b) => b.courseCount - a.courseCount)
}


