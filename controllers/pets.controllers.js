export class PetsController {
  constructor ({ petsModel }) {
    this.petsModel = petsModel
  }

  getAll = async (req, res) => {
    const pets = await this.petsModel.getAll(req.validQuery)
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
    res.json({ message: 'Pet deleted' })
  }
}
