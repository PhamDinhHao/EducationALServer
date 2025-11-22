import { Router } from 'express'
import * as certificateController from '../../controllers/certificate.controller'
import auth from '@/middlewares/auth'

const router = Router()

router.post('/', auth(), certificateController.createCertificate)
router.get('/me', auth(), certificateController.getMyCertificates)
router.get('/:id', auth(), certificateController.getCertificateById)
router.get('/:id/download', auth(), certificateController.downloadCertificate)

export default router

