import prisma from '@/client'

export interface LessonDTO {
  id?: number
  title: string
  duration: string
  src: string
  courseId: number
}

// Lấy bài học theo ID
// Lấy bài học theo ID
export const getLessonById = async (id: number) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id }
  })

  if (!lesson) {
    throw new Error('Lesson not found')
  }

  return lesson
}

// Lấy tất cả bài học của khoá học
export const getLessonsByCourse = async (courseId: number) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: true } // lấy tất cả field của bài học
  })

  if (!course) {
    throw new Error('Course not found')
  }

  return course // trả nguyên object course + lessons
}

// Thêm bài học mới
export const createLesson = async (data: LessonDTO) => {
  const lesson = await prisma.lesson.create({ data })
  return lesson
}

// Cập nhật bài học
export const updateLesson = async (id: number, data: Partial<LessonDTO>) => {
  const lesson = await prisma.lesson.update({
    where: { id },
    data
  })
  return lesson
}

// Xoá bài học
export const deleteLesson = async (id: number) => {
  await prisma.lesson.delete({ where: { id } })
  return { message: 'Lesson deleted successfully' }
}
