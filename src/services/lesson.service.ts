import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/client'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' })

// Hàm gốc gọi Gemini để sinh giáo án
const generateLesson = async (fileContent: string | undefined, grade: string, subject: string, topic: string, periods: number | undefined, lessonType: string) => {
  // Ghép prompt động, chỉ thêm tài liệu nếu có file
  const prompt = `
Bạn là một giáo viên giỏi. Hãy soạn giáo án theo chuẩn 5512.
${fileContent ? `\nĐây là tài liệu kiến thức:\n${fileContent}\n` : ''}
- Loại giáo án: ${lessonType}
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Số tiết: ${periods}

Xuất JSON theo format:
{
  "title": "Tên bài học",
  "grade": "${grade}",
  "subject": "${subject}",
  "topic": "${topic}",
  "lessonType": "${lessonType}",
  "periods": ${periods},
  "objectives": ["Mục tiêu 1", "Mục tiêu 2"],
  "activities": [
    { "step": "Khởi động", "description": "Hoạt động khởi động..." },
    { "step": "Hình thành kiến thức", "description": "..." },
    { "step": "Luyện tập", "description": "..." },
    { "step": "Vận dụng", "description": "..." }
  ],
  "assessment": "Hình thức đánh giá..."
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const clean = text.match(/\{[\s\S]*\}/)
    return clean ? JSON.parse(clean[0]) : { raw: text }
  } catch {
    return { raw: text }
  }
}

// Các loại giáo án
export const generateStandardLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string, periods: number | undefined) =>
  generateLesson(fileContent, grade, subject, topic, periods, 'Giáo án chuẩn (bám sát Bộ GD&ĐT)')

export const generateActiveLearningLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string, periods: number | undefined) =>
  generateLesson(fileContent, grade, subject, topic, periods, 'Giáo án phương pháp dạy học tích cực')

export const generateIntegratedLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string, periods: number | undefined) =>
  generateLesson(fileContent, grade, subject, topic, periods, 'Giáo án tích hợp liên môn')

export const generateSTEAMLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string, periods: number | undefined) =>
  generateLesson(fileContent, grade, subject, topic, periods, 'Giáo án STEAM')

export interface LessonDTO {
  id?: number
  title: string
  duration: string
  src: string
  courseId: number
}

// Lấy bài học theo ID
// Lấy bài học theo ID
export const getLessonByIdService = async (id: number) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id }
  })

  if (!lesson) {
    throw new Error('Lesson not found')
  }

  return lesson
}

// Lấy tất cả bài học của khoá học
export const getLessonsByCourseService = async (courseId: number) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: true
    } // lấy tất cả field của bài học
  })

  if (!course) {
    throw new Error('Course not found')
  }

  return course // trả nguyên object course + lessons
}

// Thêm bài học mới
export const createLessonService = async (data: LessonDTO) => {
  const lesson = await prisma.lesson.create({ data })
  return lesson
}

// Cập nhật bài học
export const updateLessonService = async (id: number, data: Partial<LessonDTO>) => {
  const lesson = await prisma.lesson.update({
    where: { id },
    data
  })
  return lesson
}

// Xoá bài học
export const deleteLessonService = async (id: number) => {
  await prisma.lesson.delete({ where: { id } })
  return { message: 'Lesson deleted successfully' }
}
