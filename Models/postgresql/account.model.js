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

  static async createAdapterProfile ({ userId, input }) {
    const { phone_number, address, type_house, more_pets } = input
    const { rows } = await pool.query('INSERT INTO adapter_profiles (user_id, phone_number, address, type_house, more_pets) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, phone_number, address, type_house, more_pets])
    return rows[0]
  }
}
