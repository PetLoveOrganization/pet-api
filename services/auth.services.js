import jwt from 'jsonwebtoken'
import { DEFAULTS, JWT_SECRET, REFRESH_SECRET } from '../config.js'

export const generateTokens = ({ user }) => {
  const accessToken = generateToken({ id: user.id, secret: JWT_SECRET, expiresIn: DEFAULTS.ACCESS_TOKEN_EXPIRY })
  const refreshToken = generateToken({ id: user.id, secret: REFRESH_SECRET, expiresIn: DEFAULTS.REFRESH_TOKEN_EXPIRY })
  return { accessToken, refreshToken }
}

const generateToken = ({ id, secret, expiresIn }) => {
  return jwt.sign({ id }, secret, { expiresIn })
}

export const renewAccessToken = ({ refreshToken }) => {
  try {
    const { id } = jwt.verify(refreshToken, REFRESH_SECRET)
    const accessToken = generateToken({ id, secret: JWT_SECRET, expiresIn: DEFAULTS.ACCESS_TOKEN_EXPIRY })
    return accessToken
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}
