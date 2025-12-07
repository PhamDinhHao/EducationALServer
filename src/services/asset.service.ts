import { Asset } from '@prisma/client'

import prisma from '@/client'
import { uploadService } from '@/services'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

/**
 * Upload image assets for a user and save the data in the database.
 * @param userId
 * @param files
 * @returns {Promise<Asset[]>}
 */
const uploadImage = async <Key extends keyof Asset>(
  userId: number,
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] },
  keys: Key[] = ['id', 'name', 'src'] as Key[]
): Promise<Pick<Asset, Key>[]> => {
  // Handle case where files can be an array or an object (from multipart form data)
  const allFiles = Array.isArray(files) ? files : Object.values(files).flat()


  

  // Return early if there are no files to process
  if (!allFiles || allFiles.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files to process')
  }

  // Upload each file and get the resulting URLs or paths
  const uploadedData = await Promise.all(allFiles.map(async (file) => uploadService.uploadImage('assets', file.path)))

  // If upload failed, return null
  if (!uploadedData || uploadedData.length === 0) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Upload failed')
  }

  // Create a new asset record in the database for each uploaded file
  const assetRecords = await Promise.all(
    allFiles.map((file, index) =>
      prisma.asset.create({
        data: {
          userId,
          name: file.filename,
          src: uploadedData[index]!,
          type: 'IMAGE'
        },
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
      })
    )
  )

  return assetRecords as Pick<Asset, Key>[]
}

/**
 * Retrieve image assets for a user.
 * @param userId
 * @param keys
 * @returns {Promise<Pick<Asset, Key>[]>}
 */
const getImages = async <Key extends keyof Asset>(userId: number, keys: Key[] = ['id', 'name', 'src'] as Key[]): Promise<Pick<Asset, Key>[]> => {
  // Query the database to find all assets belonging to the user, selecting only the specified keys
  const assets = await prisma.asset.findMany({
    where: { userId },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  })

  return assets as Pick<Asset, Key>[] // Return the selected fields for each asset
}

/**
 * Delete asset by id
 * @param {ObjectId} assetId
 * @returns {Promise<Asset>}
 */
const deleteImageById = async (userId: number, image: Asset): Promise<Asset> => {
  await uploadService.deleteImage(`assets/${image.name.split('.')[0]}`)
  const asset = await prisma.asset.delete({ where: { userId, id: image.id } })
  return asset
}

const getAllAssets = async <Key extends keyof Asset>(
  keys: Key[] = ['id', 'name', 'src', 'type', 'userId'] as Key[]
): Promise<Pick<Asset, Key>[]> => {
  const assets = await prisma.asset.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: { id: 'desc' }
  })
  return assets as Pick<Asset, Key>[]
}

export default {
  uploadImage,
  getImages,
  getAllAssets,
  deleteImageById
}
