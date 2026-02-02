import { PetsController } from '../controllers/pets.js'
import { Router } from 'express'
import { validateCreate, validateFilters, validateUpdate } from '../middlewares/pets.js'
// import { ACCEPTED_ORIGINS } from '../middlewares/cors.js'

export const createPetsRouter = ({ petsModel }) => {
  const petsController = new PetsController({ petsModel })
  const router = Router()

  router.get('/', validateFilters, petsController.getAll)
  router.get('/:id', petsController.getById)
  router.post('/', validateCreate, petsController.create)
  router.patch('/:id', validateUpdate, petsController.update)
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
