import { Router } from 'express'
import { AuthController } from '../controllers/auth.controllers.js'
import { validateBody } from '../middlewares/validator.middlewares.js'
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js'
import { verifyToken } from '../middlewares/auth.middlewares.js'

export const createAuthRouter = ({ authModel }) => {
  const authController = new AuthController({ authModel })
  const router = Router()
  router.post('/login', validateBody(loginSchema), authController.login)
  router.post('/register', validateBody(registerSchema), authController.register)
  router.post('/refresh', authController.refresh)
  router.post('/logout', verifyToken, authController.logout)
  return router
}
