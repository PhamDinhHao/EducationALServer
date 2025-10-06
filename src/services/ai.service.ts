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

// Danh sách các model để thử (theo thứ tự ưu tiên)
const MODELS_TO_TRY = [
  'gemini-2.5-flash',      // Model mới nhất và nhanh nhất
  'gemini-2.5-pro',        // Model chất lượng cao
  'gemini-2.0-flash',      // Model ổn định
  'gemini-2.0-flash-001',  // Model backup
  'gemini-flash-latest',   // Model latest
  'gemini-pro-latest'      // Model pro latest
]

const makeRequest = async (messages: ChatMessage[], subject: string, imageFile?: ImageFile): Promise<string> => {
  console.log('🔹 Sending request to Gemini API using Google Generative AI SDK...')
  console.log('🔹 Input messages:', JSON.stringify(messages, null, 2))

  try {
    const genAI = getGeminiClient()
    
    // Lấy message cuối cùng từ user
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()
    if (!lastUserMessage) {
      throw new Error('No user message found')
    }
    
    const prompt = lastUserMessage.content
    console.log('🔹 Using prompt:', prompt)

    // Thử các model theo thứ tự ưu tiên
    for (let i = 0; i < MODELS_TO_TRY.length; i++) {
      const modelName = MODELS_TO_TRY[i]
      
      try {
        console.log(`🔹 Trying model ${i + 1}/${MODELS_TO_TRY.length}: ${modelName}`)
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // Tăng từ 4096 lên 8192 để có đủ không gian cho nội dung đầy đủ
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
        console.log('🔹 Using simple generateContent')
        const result = await model.generateContent(promptParts)
        const response = await result.response
        const text = response.text()
        
        if (!text) {
          throw new Error('Gemini không trả về nội dung')
        }
        
        console.log(`✅ Model ${modelName} hoạt động tốt!`)
        console.log(`📝 Response length: ${text.length} characters`)
        
        // Kiểm tra xem response có bị cắt cụt không
        if (text.length < 100) {
          console.warn(`⚠️ Response quá ngắn (${text.length} chars), có thể bị cắt`)
        }
        
        // Kiểm tra xem có kết thúc đột ngột không
        const lastWords = text.trim().split(' ').slice(-3).join(' ')
        if (lastWords.includes('**4) Mẹo ghi') || text.endsWith('---') || text.endsWith('**4)')) {
          console.warn('⚠️ Response có vẻ bị cắt cụt ở phần cuối')
        }
        
        return text
        
      } catch (error: any) {
        const errorMessage = error.message || error.toString()
        console.error(`❌ Model ${modelName} failed:`, errorMessage)
        
        // Nếu không phải model cuối cùng, thử model tiếp theo
        if (i < MODELS_TO_TRY.length - 1) {
          console.log(`🔄 Thử model tiếp theo...`)
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


