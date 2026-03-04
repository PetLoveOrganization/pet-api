import { pool } from './db.js'

export class AccountModel {
  static async getById ({ id }) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    const user = rows[0]
    if (!user) {
      return null
    }
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
