import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'

export const extractUser = (req, res, next) => {
  const token = req.cookies.access_token
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
  } catch (error) {
    console.error('Token inválido en ruta pública')
  }
  next()
}
