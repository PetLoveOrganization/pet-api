import express from 'express'
import { verifyToken } from '../middlewares/auth.middlewares.js'
import { AccountController } from '../controllers/account.controller.js'
import { validateBody, validateQuery } from '../middlewares/validator.middlewares.js'
import { AdoptionRequestSchema, limitOffsetSchema } from '../schemas/filters.schemas.js'
import { adapterProfileSchema } from '../schemas/adapter-profile.schema.js'

export const createAccountsRouter = ({ accountModel }) => {
  const router = express.Router()
  const accountController = new AccountController({ accountModel })

  router.use(verifyToken)
  router.get('/me', accountController.me)
  router.get('/adopter-profile', accountController.getAdapterProfile)
  router.patch('/adopter-profile', validateBody(adapterProfileSchema), accountController.updateAdapterProfile)
  router.get('/favorites', validateQuery(limitOffsetSchema), accountController.getFavoritePets)
  router.get('/favorites/ids', accountController.getFavoriteIds)
  router.get('/adoption-requests', validateQuery(AdoptionRequestSchema), accountController.getAdoptionRequests)
  return router
}
