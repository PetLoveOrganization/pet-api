import { PetsController } from '../controllers/pets.controllers.js'
import { Router } from 'express'
import { validateBody, validateParams, validateQuery } from '../middlewares/validator.middlewares.js'
import { filtersSchema } from '../schemas/filters.schemas.js'
import { createPetSchema, updatePetSchema } from '../schemas/pet.schemas.js'
import { verifyToken } from '../middlewares/auth.middlewares.js'
import { paramsSchema } from '../schemas/params.schemas.js'
import { extractUser } from '../middlewares/extract-user.middleware.js'
import { FavoriteController } from '../controllers/favorite.controller.js'

export const createPetsRouter = ({ petsModel, accountModel }) => {
  const petsController = new PetsController({ petsModel, accountModel })
  const favoriteController = new FavoriteController({ accountModel })

  const router = Router()
  router.get('/', validateQuery(filtersSchema.partial()), petsController.getAll)
  router.get('/:id', extractUser, validateParams(paramsSchema), petsController.getById)

  router.use(verifyToken)

  router.post('/', validateBody(createPetSchema), petsController.create)

  router.patch('/:id', validateParams(paramsSchema), validateBody(updatePetSchema), petsController.update)
  router.delete('/:id', validateParams(paramsSchema), petsController.delete)
  router.post('/:id/favorite', validateParams(paramsSchema), favoriteController.toggleFavorite)

  return router
}
