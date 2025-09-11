// src/modules/Course/services/course.service.ts
import prisma from '@/client'
import { Course, Lesson } from '@prisma/client'

export interface CourseDTO {
  title: string
  description: string
  img: string
  url?: string
    introductions?: string[]   // thêm trường introductions kiểu array string

}

// Trả về tất cả khóa học
export const getAllCourses = async (): Promise<(Course & { lessons: Lesson[] })[]> => {
  return prisma.course.findMany({
    include: { lessons: true }, // kèm danh sách bài học
  })
}

// Trả về khóa học theo id + lessons
export const getCourseById = async (
  id: number
): Promise<(Course & { lessons: Lesson[] }) | null> => {
  return prisma.course.findUnique({
    where: { id },
    include: { lessons: true },
  })
}

// Tạo khóa học mới
export const createCourse = async (data: CourseDTO): Promise<Course> => {
  return prisma.course.create({ data })
}

// Cập nhật khóa học
export const updateCourse = async (
  id: number,
  data: Partial<CourseDTO>
): Promise<Course> => {
  // Kiểm tra tồn tại
  const existing = await prisma.course.findUnique({ where: { id } })
  if (!existing) throw new Error('Course not found')

  return prisma.course.update({
    where: { id },
    data,
  })
}

// Xoá khóa học
export const deleteCourse = async (id: number): Promise<Course> => {
  const existing = await prisma.course.findUnique({ where: { id } })
  if (!existing) throw new Error('Course not found')

  return prisma.course.delete({ where: { id } })
}
