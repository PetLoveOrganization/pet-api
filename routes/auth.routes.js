import { Router } from 'express'
import { AuthController } from '../controllers/auth.controllers.js'

export const createAuthRouter = ({ authModel }) => {
  const authController = new AuthController({ authModel })
  const router = Router()
  router.post('/login', authController.login)
  router.post('/register', authController.register)
  router.post('/refresh', authController.refresh)
  router.post('/logout', authController.logout)
  return router
}
