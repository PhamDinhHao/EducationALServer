import catchAsync from '@utils/catchAsync'
import { geminiService } from '@/services'
import { extractTextFromFile } from '@/utils/fileParser'

const generateExam = catchAsync(async (req, res) => {
  // nhận matrix từ body
  const { matrix } = req.body
  // nhận file từ multer
  const file = req.file
  if (!file) {
    return res.status(400).json({ message: 'Vui lòng upload file PDF hoặc DOCX' })
  }

  // parse nội dung từ file
  const fileContent = await extractTextFromFile(file.path)

  // gọi Gemini sinh đề
  const exam = await geminiService.generateExam(fileContent, matrix)
  res.send(exam)
})

export default {
  generateExam
}
