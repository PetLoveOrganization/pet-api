import { PetsController } from '../controllers/pets.controllers.js'
import { Router } from 'express'
import { validateBody, validateParams, validateQuery } from '../middlewares/validator.middlewares.js'
import { filtersSchema } from '../schemas/filters.schemas.js'
import { createPetSchema, updatePetSchema } from '../schemas/pet.schemas.js'
import { verifyToken } from '../middlewares/auth.middlewares.js'
import { paramsSchema } from '../schemas/params.schemas.js'

export const createPetsRouter = ({ petsModel }) => {
  const petsController = new PetsController({ petsModel })
  const router = Router()
  router.get('/', validateQuery(filtersSchema.partial()), petsController.getAll)
  router.get('/:id', validateParams(paramsSchema), petsController.getById)

  router.use(verifyToken)

  router.post('/', validateBody(createPetSchema), petsController.create)
  router.patch('/:id', validateParams(paramsSchema), validateBody(updatePetSchema), petsController.update)
  router.delete('/:id', validateParams(paramsSchema), petsController.delete)

  return router
}
