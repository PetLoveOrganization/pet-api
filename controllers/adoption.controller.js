export class AdoptionController {
  constructor ({ adoptionModel }) {
    this.adoptionModel = adoptionModel
  }

  createAdoptionFull = async (req, res, next) => {
    try {
      const { id } = req.user
      const adoption = await this.adoptionModel.createAdoptionFull({ userId: id, input: req.body })
      res.status(201).json({ status: 'success', adoption })
    } catch (error) {
      next(error)
    }
  }
}
