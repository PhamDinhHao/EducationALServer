import config from '@/configs/config'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  secure: true,
  url: config.cloudinary.url
})

const uploadImage = async (folder: string, imagePath: string) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder
  }

  try {
    // Upload the image
    const { url } = await cloudinary.uploader.upload(imagePath, options)
    return url
  } catch (error) {
    console.error(error)
  }
}

const deleteImage = async (publicId: string) => {
  try {
    // Delete the image
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error(error)
  }
}

export default { uploadImage, deleteImage }
