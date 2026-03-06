import express from 'express'
import { corsMiddleware } from './middlewares/cors.middlewares.js'
import { createPetsRouter } from './routes/pets.routes.js'
import { PetsModel } from './models/postgresql/pets.model.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { AuthModel } from './models/postgresql/auth.model.js'
import { PORT } from './config.js'
import { errorHandlerMiddleware } from './middlewares/error.middlewares.js'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createAccountsRouter } from './routes/account.router.js'
import { AccountModel } from './models/postgresql/account.model.js'
import { AdoptionModel } from './models/postgresql/adoption.model.js'
import { createAdoptionRouter } from './routes/adoption.router.js'

const app = express()

app.use(corsMiddleware())
app.use(express.json())
app.use(cookieParser())

app.use(morgan('dev'))

app.use('/auth', createAuthRouter({ authModel: AuthModel }))
app.use('/pets', createPetsRouter({ petsModel: PetsModel, accountModel: AccountModel }))
app.use('/account', createAccountsRouter({ accountModel: AccountModel }))
app.use('/adoptions', createAdoptionRouter({ adoptionModel: AdoptionModel }))

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
