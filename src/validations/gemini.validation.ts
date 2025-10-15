import { z } from 'zod'

// Cấu trúc ma trận: { "Loại câu hỏi": { "Mức độ": số lượng } }
const matrixSchema = z.record(
  z.string(), // key = loại câu hỏi
  z.record(
    z.string(), // key = mức độ
    z.number().min(0) // value = số câu hỏi
  )
)

const generateExam = {
  body: z.object({
    fileContent: z.string().optional(),
    matrix: z.preprocess((val) => {
      // Nếu val là string → parse JSON
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch {
          return undefined // sẽ fail validate
        }
      }
      return val
    }, matrixSchema) // cuối cùng validate theo schema
  })
} as const

export default {
  generateExam
}
