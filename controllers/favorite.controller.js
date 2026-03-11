export class FavoriteController {
  constructor ({ accountModel }) {
    this.accountModel = accountModel
  }

  toggleFavorite = async (req, res) => {
    const { id: petId } = req.params
    const { id: userId } = req.user
    const result = await this.accountModel.toggleFavorite({ userId, petId })
    res.json({
      success: true,
      isFavorite: result.isFavorite
    })
  }
}
