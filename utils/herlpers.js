import { DEFAULTS } from '../config.js'
import { generateTokens } from '../services/auth.services.js'

export const sendTokenCookies = (res, user) => {
  const { accessToken, refreshToken } = generateTokens({ user })
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: DEFAULTS.MAX_AGE_ACCESS_TOKEN
  })
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: DEFAULTS.MAX_AGE_REFRESH_TOKEN,
    path: '/auth/refresh'
  })
  return { accessToken, refreshToken }
}
