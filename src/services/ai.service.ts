import { GoogleGenerativeAI } from '@google/generative-ai'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date | string
}

export type ImageFile = {
  mimeType: string
  base64Data: string
}

// Khởi tạo Google Generative AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình')
  }
  return new GoogleGenerativeAI(apiKey)
}

// Danh sách các model để thử (theo thứ tự ưu tiên - tối ưu nhất)
const MODELS_TO_TRY = [
  'gemini-2.0-flash-001', // 🏆 Model tối ưu nhất: nhanh nhất (2218ms), ổn định, chất lượng cao
  'gemini-2.0-flash', // Backup model 2.0 (2392ms)
  'gemini-3-27b', // Latest fallback (6337ms)
  'gemini-pro-latest' // Pro latest fallback (24165ms) - chậm nhưng chất lượng cao
]

const makeRequest = async (messages: ChatMessage[], subject: string, imageFile?: ImageFile): Promise<string> => {
  try {
    const genAI = getGeminiClient()

    const prompt = messages.map((msg) => msg.content).join('\n')
    // Xác định temperature dựa trên loại task
    const getTemperature = (subject: string, prompt: string): number => {
      if (subject === 'mindmap' || prompt.includes('mindmap')) {
        return 0.3 // Thấp cho JSON structure
      } else if (subject === 'review' || prompt.includes('ôn tập')) {
        return 0.5 // Trung bình cho educational content
      } else if (subject === 'exercise' || prompt.includes('giải bài')) {
        return 0.2 // Rất thấp cho accuracy
      } else if (prompt.includes('GDPT 2018')) {
        return 0.4 // Thấp cho curriculum compliance
      }
      return 0.7 // Default
    }

    const temperature = getTemperature(subject, prompt)

    // Thử các model theo thứ tự ưu tiên
    for (let i = 0; i < MODELS_TO_TRY.length; i++) {
      const modelName = MODELS_TO_TRY[i]

      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16384 // Tăng lên 16384 để có đủ không gian cho mindmap chi tiết 3 cấp độ
          }
        })

        // Tạo prompt parts
        const promptParts: any[] = [{ text: prompt }]

        if (imageFile) {
          if (!imageFile.base64Data || imageFile.base64Data.trim() === '') {
            throw new Error('Image data is empty')
          }

          promptParts.push({
            inlineData: {
              mimeType: imageFile.mimeType,
              data: imageFile.base64Data
            }
          })
        }

        // Sử dụng generateContent đơn giản
        const result = await model.generateContent(promptParts)
        const response = await result.response
        const text = response.text()

        if (!text) {
          throw new Error('Gemini không trả về nội dung')
        }

        // Kiểm tra xem response có bị cắt cụt không
        if (text.length < 100) {
        }

        // Kiểm tra xem có kết thúc đột ngột không
        const lastWords = text.trim().split(' ').slice(-3).join(' ')
        if (lastWords.includes('**4) Mẹo ghi') || text.endsWith('---') || text.endsWith('**4)')) {
        }

        return text
      } catch (error: any) {
        const errorMessage = error.message || error.toString()

        // Nếu không phải model cuối cùng, thử model tiếp theo
        if (i < MODELS_TO_TRY.length - 1) {
          continue
        } else {
          // Model cuối cùng cũng fail
          throw new Error(`Tất cả các model đều không hoạt động. Lỗi cuối cùng: ${errorMessage}`)
        }
      }
    }

    throw new Error('Không có model nào hoạt động')
  } catch (error: any) {
    console.error('❌ Gemini API error:', error.message)
    throw new Error(`Gemini API error: ${error.message}`)
  }
}

const generateText = async (prompt: string): Promise<string> => {
  return makeRequest([{ role: 'user', content: prompt }], 'text-generation')
}

export default { makeRequest, generateText }
