import { JWT_SECRET } from '../config.js'
import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No access token provided' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log({ decoded })
    req.user = decoded
    next()
  } catch (error) {
    console.log(error)
    return res.status(403).json({ status: 'error', message: 'Forbidden: Invalid access token' })
  }
}
