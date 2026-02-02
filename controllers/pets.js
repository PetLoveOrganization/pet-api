import { validatePartialFilters } from '../schemas/filters.js'
import { getFieldErrors } from '../utils.js'

export class PetsController {
  constructor ({ petsModel }) {
    this.petsModel = petsModel
  }

  getAll = async (req, res) => {
    const result = validatePartialFilters(req.query)
    if (!result.success) {
      return res.status(400).json({ message: getFieldErrors(result.error) })
    }
    const pets = await this.petsModel.getAll(result.data)
    res.json(pets)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const pet = await this.petsModel.getById({ id })
    if (!pet) {
      return res.status(404).json({ status: 'error', message: 'Pet not found' })
    }
    res.json(pet)
  }

  create = async (req, res, next) => {
    try {
      const pet = await this.petsModel.create({ input: req.body })
      res.json(pet)
    } catch (error) {
      next(error)
    }
  }

  update = async (req, res) => {
    const { id } = req.params
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
    res.json({ message: 'Pet deleted' })
  }
}
