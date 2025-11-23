import prisma from '@/client'
import { CourseLevel } from '@prisma/client'

export const listCourses = async () => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { courseType: true }
  })

  const enrollmentCounts = await prisma.courseEnrollment.groupBy({
    by: ['courseId'],
    _count: { courseId: true },
  })

  return courses.map((course) => ({
    ...course,
    enrollCount: enrollmentCounts.find((ec) => ec.courseId === course.id)?._count.courseId || 0,
    students: enrollmentCounts.find((ec) => ec.courseId === course.id)?._count.courseId || course.students || 0,
  }))
}

export const getCourseById = async (id: number) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { courseType: true, lessons: { orderBy: { order: 'asc' } } }
  })

  if (!course) return null

  const enrollmentCount = await prisma.courseEnrollment.count({
    where: { courseId: id }
  })

  return {
    ...course,
    enrollCount: enrollmentCount,
    students: enrollmentCount || course.students || 0,
  }
}

export const createCourse = async (input: {
  title: string
  description: string
  img?: string | null
  url?: string | null
  teacher: string
  students?: number
  duration?: string | null
  courseTypeId: number
  level?: CourseLevel | null
}) => {
  return prisma.course.create({ data: input })
}

export const updateCourse = async (
  id: number,
  input: Partial<{
    title: string
    description: string
    img?: string | null
    url?: string | null
    teacher: string
    students: number
    duration?: string | null
    courseTypeId: number
    level?: CourseLevel | null
  }>
) => {
  return prisma.course.update({ where: { id }, data: input })
}

export const deleteCourse = async (id: number) => {
  return prisma.course.delete({ where: { id } })
}

export const getTopEnrolledCourses = async (limit: number = 8) => {
  const topCourses = await prisma.courseEnrollment.groupBy({
    by: ['courseId'],
    _count: { courseId: true },
    orderBy: { _count: { courseId: 'desc' } },
    take: limit,
  });

  const courseIds = topCourses.map((item) => item.courseId);
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    include: { courseType: true },
  });

  return courses.map((c) => ({
    ...c,
    enrollCount: topCourses.find((t) => t.courseId === c.id)?._count.courseId || 0,
  })).sort((a, b) => b.enrollCount - a.enrollCount);
}

export const getCoursesByCategoryId = async (categoryId: number) => {
  const courses = await prisma.course.findMany({
    where: { courseTypeId: categoryId },
    orderBy: { createdAt: 'desc' },
    include: { courseType: true }
  })

  // Get enrollment counts for all courses
  const enrollmentCounts = await prisma.courseEnrollment.groupBy({
    by: ['courseId'],
    _count: { courseId: true },
  })

  // Map enrollment counts to courses
  return courses.map((course) => ({
    ...course,
    enrollCount: enrollmentCounts.find((ec) => ec.courseId === course.id)?._count.courseId || 0,
    students: enrollmentCounts.find((ec) => ec.courseId === course.id)?._count.courseId || course.students || 0,
  }))
}

export const queryCourses = async (options: {
  limit?: number
  page?: number
  sortBy?: string
  sortType?: 'asc' | 'desc'
  search?: string
  courseTypeId?: number
}) => {
  const page = options.page ?? 1
  const limit = options.limit ?? 12
  const sortBy = options.sortBy ?? 'createdAt'
  const sortType = options.sortType ?? 'desc'
  const search = options.search?.trim()
  const courseTypeId = options.courseTypeId


  const where: any = {}
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { teacher: { contains: search } }
    ]
  }

  if (courseTypeId) {
    where.courseTypeId = courseTypeId
  }

  const total = await prisma.course.count({ where })

  const courses = await prisma.course.findMany({
    where,
    include: { courseType: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortType }
  })

  // Get enrollment counts for all courses in this page
  const courseIds = courses.map((c) => c.id)
  const enrollmentCounts = await prisma.courseEnrollment.groupBy({
    by: ['courseId'],
    _count: { courseId: true },
    where: { courseId: { in: courseIds } }
  })

  // Map enrollment counts to courses
  const coursesWithEnrollCount = courses.map((course) => ({
    ...course,
    enrollCount: enrollmentCounts.find((ec) => ec.courseId === course.id)?._count.courseId || 0,
    students: enrollmentCounts.find((ec) => ec.courseId === course.id)?._count.courseId || course.students || 0,
  }))

  const totalPages = Math.ceil(total / limit)

  return {
    data: coursesWithEnrollCount,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  }
}


