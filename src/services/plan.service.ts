import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-3-27b' })

/**
 * Sinh kế hoạch cá nhân
 */
const generatePlan = async (data: any) => {
  const prompt = `
  Bạn là giáo viên. Hãy tạo một bản kế hoạch cá nhân chi tiết.

  Dữ liệu đầu vào:
  - Môn: ${data.subject}
  - Năm học: ${data.year}
  - Trường: ${data.school}
  - Lớp giảng dạy: ${data.class}
  - Nhiệm vụ: ${data.tasks?.join(', ')}

  Hãy viết kế hoạch theo định dạng văn bản, có cấu trúc rõ ràng: 
  - Mục tiêu
  - Nhiệm vụ chính
  - Hoạt động cụ thể
  - Dự kiến kết quả

  `

  const result = await model.generateContent(prompt)
  return result.response.text()
}

/**
 * Sinh sáng kiến kinh nghiệm
 */
const generateInitiative = async (data: any) => {
  const prompt = `
  Bạn là giáo viên. Hãy viết một bản sáng kiến kinh nghiệm.
  Dữ liệu đầu vào:
  - Môn: ${data.subject}
  - Trường: ${data.schoolName}
  - Họ tên: ${data.fullName}
  - Chức vụ: ${data.position}
  - Lĩnh vực áp dụng: ${data.field}
  - Tên đề tài: ${data.topic}

  Yêu cầu: viết sáng kiến theo cấu trúc:
  - Đặt vấn đề
  - Thực trạng
  - Giải pháp đề xuất
  - Kết quả dự kiến / thực nghiệm
  - Kết luận
  `

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export default {
  generatePlan,
  generateInitiative
}
