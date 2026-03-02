import express from 'express'
import { verifyToken } from '../middlewares/auth.middlewares.js'
import { AccountController } from '../controllers/account.controller.js'
import { validateBody } from '../middlewares/validator.middlewares.js'
import { adapterProfileSchema } from '../schemas/adapter-profile.schema.js'

export const createAccountsRouter = ({ accountModel }) => {
  const router = express.Router()
  const accountController = new AccountController({ accountModel })

  router.use(verifyToken)

  router.get('/me', accountController.me)
  router.get('/adopter-profile', accountController.getAdapterProfile)
  router.post('/adopter-profile', validateBody(adapterProfileSchema), accountController.createAdapterProfile)

  return router
}
