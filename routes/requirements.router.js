import { Router } from 'express'
import { RequirementsController } from '../controllers/requirements.controller.js'
import { verifyToken } from '../middlewares/auth.middlewares.js'

export const createRequirementsRouter = ({ requirementsModel }) => {
  const router = Router()
  const requirementsController = new RequirementsController({ requirementsModel })

  router.get('/', verifyToken, requirementsController.getAll)

  return router
}
