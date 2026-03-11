import express from 'express'
import { verifyToken } from '../middlewares/auth.middlewares.js'
import { AccountController } from '../controllers/account.controller.js'
import { validateQuery } from '../middlewares/validator.middlewares.js'
import { limitOffsetSchema } from '../schemas/filters.schemas.js'

export const createAccountsRouter = ({ accountModel }) => {
  const router = express.Router()
  const accountController = new AccountController({ accountModel })

  router.use(verifyToken)
  router.get('/me', accountController.me)
  router.get('/adopter-profile', accountController.getAdapterProfile)
  router.get('/favorites', validateQuery(limitOffsetSchema), accountController.getFavoritePets)
  router.get('/favorites/ids', accountController.getFavoriteIds)

  return router
}
