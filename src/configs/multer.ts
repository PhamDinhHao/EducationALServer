import multer from 'multer'
import fs from 'fs'
import path from 'path'

// Create the tmp/uploads folder if it doesn't exist
const uploadDir = path.join('tmp', 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This part defines where the files need to be saved
    cb(null, 'tmp/uploads')
  },
  filename: (req, file, cb) => {
    // This part sets the file name of the file
    cb(null, file.originalname)
  }
})

// Then we will set the storage
export const upload = multer({ storage: storage })
