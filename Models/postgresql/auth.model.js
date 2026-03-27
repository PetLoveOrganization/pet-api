import { SALT_ROUNDS } from '../../config.js'
import { pool } from '../../config/db.js'
import bcrypt from 'bcrypt'
export class AuthModel {
  static async login ({ email, password }) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]
    if (!user) {
      return null
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async register ({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const { rows } = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword])
    const { password: _, ...user } = rows[0]
    return user
  }
}
