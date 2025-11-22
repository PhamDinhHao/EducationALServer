import { Request, Response } from 'express'
import * as certificateService from '../services/certificate.service'

export const createCertificate = async (req: Request, res: Response) => {
  const user = req.user as { id: number } | undefined
  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const courseId = Number(req.body.course_id || req.body.courseId)
  if (!courseId || isNaN(courseId)) {
    return res.status(400).json({ message: 'Course ID không hợp lệ' })
  }

  try {
    const certificate = await certificateService.createCertificate(user.id, courseId)
    res.json(certificate)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyCertificates = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const certificates = await certificateService.getUserCertificates(user.id)
    res.json(certificates)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getCertificateById = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const certificateId = parseInt(req.params.id)
  
  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  if (isNaN(certificateId)) {
    return res.status(400).json({ message: 'Certificate ID không hợp lệ' })
  }

  try {
    const certificate = await certificateService.getCertificateById(certificateId, user.id)
    if (!certificate) {
      return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' })
    }
    res.json(certificate)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const downloadCertificate = async (req: Request, res: Response) => {
  const user = req.user as { id: number }
  const certificateId = parseInt(req.params.id)
  
  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  if (isNaN(certificateId)) {
    return res.status(400).json({ message: 'Certificate ID không hợp lệ' })
  }

  try {
    const certificate = await certificateService.getCertificateById(certificateId, user.id)
    if (!certificate) {
      return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' })
    }

    // If PDF URL exists, redirect to it
    if (certificate.pdfUrl) {
      return res.redirect(certificate.pdfUrl)
    }

    // If image URL exists, redirect to it
    if (certificate.imageUrl) {
      return res.redirect(certificate.imageUrl)
    }

    // Otherwise return certificate data for client-side generation
    res.json(certificate)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

