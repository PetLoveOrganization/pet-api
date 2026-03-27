import { deleteFromCloudinary, uploadOptimizedImage } from '../services/image.services.js'

export class PetsController {
  constructor ({ petsModel, accountModel }) {
    this.petsModel = petsModel
    this.accountModel = accountModel
  }

  getAll = async (req, res) => {
    const pets = await this.petsModel.getAll(req.validQuery)
    res.json(pets)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const userId = req.user?.id || null
    const pet = await this.petsModel.getById({ id, userId })
    if (!pet) {
      return res.status(404).json({ status: 'error', message: 'Pet not found' })
    }
    if (userId) {
      pet.user_context = await this.accountModel.getAdoptionContext({ petId: id, userId })
    }
    res.json(pet)
  }

  create = async (req, res, next) => {
    try {
      const { id: userId } = req.user
      const { files } = req
      const { primary_index, name } = req.body
      const uploadPromises = files.map(file =>
        uploadOptimizedImage(file.buffer, name)
      )
      const uploadedImages = await Promise.all(uploadPromises)
      const images = uploadedImages.map((result, index) => ({
        image_url: result.url,
        public_id: result.public_id,
        is_primary: index === primary_index
      }))
      const pet = await this.petsModel.create({ input: { ...req.body, images }, userId })
      res.status(201).json(pet)
    } catch (error) {
      next(error)
    }
  }

  update = async (req, res) => {
    const { id } = req.params
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ status: 'error', message: 'No data provided' })
    }
    const updatePet = await this.petsModel.update({ id, input: req.body })
    if (!updatePet) {
      return res.status(404).json({ status: 'error', message: 'Pet not found' })
    }
    res.json(updatePet)
  }

  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.petsModel.delete({ id })
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Pet not found' })
    }
    deleteFromCloudinary(result.deleted_images)
    res.json({ message: 'Pet deleted' })
  }
}
