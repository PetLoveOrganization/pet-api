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
    const { id } = req.user
    const user = await this.accountModel.getAdapterProfile({ id })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  }

  getFavoritePets = async (req, res) => {
    const { id: userId } = req.user
    const { validQuery } = req
    const pets = await this.accountModel.getFavoritePets({ validQuery, userId })
    return res.json(pets)
  }

  getFavoriteIds = async (req, res) => {
    const { id: userId } = req.user
    const result = await this.accountModel.getFavoriteIds({ userId })
    res.json({
      success: true,
      favoriteIds: result
    })
  }
}
