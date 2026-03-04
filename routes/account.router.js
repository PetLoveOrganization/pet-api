import express from 'express'
import { verifyToken } from '../middlewares/auth.middlewares.js'
import { AccountController } from '../controllers/account.controller.js'

export const createAccountsRouter = ({ accountModel }) => {
  const router = express.Router()
  const accountController = new AccountController({ accountModel })

  router.use(verifyToken)

  router.get('/me', accountController.me)
  router.get('/adopter-profile', accountController.getAdapterProfile)

  return router
}
