import express from 'express'
import { corsMiddleware } from './middlewares/cors.middlewares.js'
import { createPetsRouter } from './routes/pets.routes.js'
import { PetsModel } from './models/postgresql/pets.model.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { AuthModel } from './models/auth.model.js'
import { PORT } from './config.js'
import { errorHandlerMiddleware } from './middlewares/error.middlewares.js'
import morgan from 'morgan'

const app = express()

app.use(corsMiddleware())
app.use(morgan('dev'))
app.use(express.json())

app.use('/auth', createAuthRouter({ authModel: AuthModel }))
app.use('/pets', createPetsRouter({ petsModel: PetsModel }))

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
