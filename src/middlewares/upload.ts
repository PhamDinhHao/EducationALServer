import multer from 'multer'
import path from 'path'

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads/') // 📂 thư mục lưu file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // ⏱ đặt tên file duy nhất
  }
})

// Chỉ cho phép các loại file nhất định (PDF, DOCX, hình ảnh)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('❌ Chỉ hỗ trợ PDF, DOCX hoặc Hình ảnh (JPG, PNG, WEBP)'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // ⛔ Giới hạn 20MB
})

export default upload
