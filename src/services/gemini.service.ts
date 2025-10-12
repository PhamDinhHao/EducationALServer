import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' })

/**
 * Gọi Gemini sinh đề thi
 * @param fileContent Nội dung text trích xuất từ PDF/Word
 * @param matrix Cấu trúc đề (loại câu hỏi, mức độ...)
 */
const generateExam = async (fileContent: string, matrix: any) => {
  const prompt = `
  Đây là tài liệu kiến thức:
  ${fileContent}

  Yêu cầu: Tạo đề thi theo cấu trúc:
  ${JSON.stringify(matrix, null, 2)}

  Xuất kết quả JSON:
  [
    {
      "type": "Loại câu hỏi",
      "level": "Mức độ",
      "question": "Câu hỏi...",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": "Đáp án đúng"
    }
  ]
  `
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    return JSON.parse(text) // parse JSON nếu Gemini trả về đúng format
  } catch (e) {
    return { raw: text } // fallback
  }
}

export default {
  generateExam
}
