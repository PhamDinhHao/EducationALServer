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
Bạn là hệ thống tạo đề thi đạt chuẩn JSON Output.

========================================
# 1. TÀI LIỆU KIẾN THỨC
${fileContent}

========================================
# 2. CẤU TRÚC ĐỀ THI CẦN TẠO
${JSON.stringify(matrix, null, 2)}

========================================
# 3. QUY TẮC TẠO ĐỀ
- Tạo đề thi bám sát tài liệu kiến thức.
- Số lượng câu hỏi theo đúng matrix.
- Tuyệt đối không thêm bớt cấu trúc.
- Tất cả output phải là **JSON hợp lệ**.
- Các nhóm câu hỏi phải được chia theo **"type"**.

----------------------------------------
## 3.1. Loại "Nhiều phương án lựa chọn"
Format JSON chuẩn:
{
  "type": "Nhiều phương án lựa chọn",
  "questions": [
    {
      "level": "Nhận biết / Thông hiểu / Vận dụng",
      "question": "Câu hỏi...",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": "A"   // chỉ ghi A/B/C/D
    }
  ]
}

----------------------------------------
## 3.2. Loại "Trắc nghiệm đúng sai"
- Có 2 câu lớn, mỗi câu gồm nhiều mệnh đề a,b,c,d.
Format JSON chuẩn:
{
  "type": "Trắc nghiệm đúng sai",
  "questions": [
    {
      "question": "Câu hỏi lớn...",
      "statements": ["a...", "b...", "c...", "d..."],
      "answer": ["a", "c"]     // danh sách các mệnh đề đúng
    }
  ]
}

----------------------------------------
## 3.3. Loại "Trả lời ngắn"
Format JSON chuẩn:
{
  "type": "Trả lời ngắn",
  "questions": [
    {
      "level": "Mức độ",
      "question": "Câu hỏi...",
      "answer": "Đáp án đúng"
    }
  ]
}

========================================
# 4. YÊU CẦU OUTPUT
→ Trả về **CHỈ DUY NHẤT** một JSON theo đúng format:
[
  {
    "type": "...",
    "questions": [ ... ]
  },
  {
    "type": "...",
    "questions": [ ... ]
  }
]
→ Không giải thích.
→ Không thêm văn bản ngoài JSON.
→ Không được sai cấu trúc như trên.
========================================
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
