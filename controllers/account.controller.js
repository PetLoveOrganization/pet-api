export class AccountController {
  constructor ({ accountModel }) {
    this.accountModel = accountModel
  }

  me = async (req, res) => {
    const { id } = req.user
    const user = await this.accountModel.getById({ id })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  }

  getAdapterProfile = async (req, res) => {
    const { id } = req.params
    const user = await this.accountModel.getById({ id })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  }
}
