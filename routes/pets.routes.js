import { PetsController } from '../controllers/pets.controllers.js'
import { Router } from 'express'
import { validateBody, validateQuery } from '../middlewares/validator.middlewares.js'
import { filtersSchema } from '../schemas/filters.schemas.js'
import { petSchema } from '../schemas/pet.schemas.js'
// import { ACCEPTED_ORIGINS } from '../middlewares/cors.js'

export const createPetsRouter = ({ petsModel }) => {
  const petsController = new PetsController({ petsModel })
  const router = Router()
  router.get('/', validateQuery(filtersSchema.partial()), petsController.getAll)
  router.get('/:id', petsController.getById)
  router.post('/', validateBody(petSchema), petsController.create)
  router.patch('/:id', validateBody(petSchema.partial()), petsController.update)
  router.delete('/:id', petsController.delete)

  // router.options('/:id', (req, res) => {
  //   const origin = req.header('Origin')
  //   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //     res.header('Access-Control-Allow-Origin', origin)
  //     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  //   }
  //   res.send()
  // })
  return router
}
