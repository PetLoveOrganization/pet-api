import { DEFAULTS } from '../config.js'
import { renewAccessToken } from '../services/auth.services.js'
import { sendTokenCookies } from '../utils/herlpers.js'

export class AuthController {
  constructor ({ authModel }) {
    this.authModel = authModel
  }

  login = async (req, res) => {
    const { email, password } = req.body
    const user = await this.authModel.login({ email, password })
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
    }
    sendTokenCookies(res, user)
    res.json({
      message: 'Login successful',
      user
    })
  }

  register = async (req, res) => {
    const { name, email, password } = req.body
    const user = await this.authModel.register({ name, email, password })
    sendTokenCookies(res, user)
    res.status(201).json({
      message: 'User created successfully',
      user
    })
  }

  refresh = async (req, res) => {
    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' })
    }
    const accessToken = renewAccessToken({ refreshToken })
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: DEFAULTS.MAX_AGE_ACCESS_TOKEN
    })
    res.json({ message: 'Access token renewed' })
  }

  logout = async (req, res) => {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token', { path: '/auth/refresh' })
    res.json({ message: 'Logout successful' })
  }
}
