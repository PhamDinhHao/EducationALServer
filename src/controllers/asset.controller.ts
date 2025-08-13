import httpStatus from 'http-status'
import { User } from '@prisma/client'
import { Request, Response } from 'express'

import prisma from '@/client'
import { assetService } from '@/services'
import catchAsync from '@/utils/catchAsync'

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  const files = req.files
  if (!files) {
    res.status(httpStatus.BAD_REQUEST).send({ error: 'No files provided' })
    return
  }
  const user = req.user as User
  const data = await assetService.uploadImage(user.id, files)
  res.status(httpStatus.CREATED).send({ data })
})

const getImages = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as User
  const data = await assetService.getImages(user.id)
  res.status(httpStatus.OK).send(data)
})

const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as User
  const { id } = req.params
  const image = await prisma.asset.findUnique({
    where: { userId: user.id, id: +id }
  })
  if (!image) {
    res.status(httpStatus.NOT_FOUND).send({ error: 'Image not found' })
    return
  }
  await assetService.deleteImageById(user.id, image)
  res.status(httpStatus.NO_CONTENT).send()
})

export default {
  uploadImage,
  getImages,
  deleteImage
}
