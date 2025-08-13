import express from 'express'

import auth from '@/middlewares/auth'
import { upload } from '@/configs/multer'
import { assetController } from '@/controllers'

const router = express.Router()

router.route('/').get(auth(), assetController.getImages).post(auth(), upload.array('files'), assetController.uploadImage)
router.route('/:id').delete(auth(), assetController.deleteImage)

export default router
