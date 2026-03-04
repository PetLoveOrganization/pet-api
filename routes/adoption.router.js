import { Router } from 'express'
import { validateBody } from '../middlewares/validator.middlewares.js'
import { AdoptionController } from '../controllers/adoption.controller.js'
import { adoptionRequestSchema } from '../schemas/adapter-profile.schema.js'
import { verifyToken } from '../middlewares/auth.middlewares.js'

export const createAdoptionRouter = ({ adoptionModel }) => {
  const router = Router()
  const adoptionController = new AdoptionController({ adoptionModel })

  router.use(verifyToken)

  router.post('/', validateBody(adoptionRequestSchema), adoptionController.createAdoptionFull)

  return router
}
