import sharp from 'sharp'
import cloudinary from '../config/cloudinary.js'

export const uploadOptimizedImage = async (fileBuffer, name, folder = 'petlove/pets') => {
  try {
    const processedBuffer = await sharp(fileBuffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('webp')
      .webp({
        quality: 80,
        lossless: false,
        nearLossless: false,
        smartSubsample: true
      })
      .toBuffer()

    const cleanPetName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const uniqueId = `${cleanPetName}-${Date.now()}`
    const options = {
      folder,
      public_id: uniqueId,
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error)
          else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            })
          }
        }
      )
      uploadStream.end(processedBuffer)
    })
  } catch (error) {
    console.error('Error procesando imagen:', error)
    throw error
  }
}

export const deleteFromCloudinary = async (publicIds = []) => {
  publicIds.forEach((publicId) => {
    cloudinary.uploader.destroy(publicId)
  })
}
