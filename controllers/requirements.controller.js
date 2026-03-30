export class RequirementsController {
  constructor ({ requirementsModel }) {
    this.requirementsModel = requirementsModel
  }

  getAll = async (req, res) => {
    const result = await this.requirementsModel.getAll()
    res.json(result)
  }
}
