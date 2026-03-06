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

  static async getAdapterProfile ({ id }) {
    const { rows } = await pool.query('SELECT * FROM adopter_profiles WHERE user_id = $1', [id])
    const adopterProfile = rows[0]
    if (!adopterProfile) {
      return null
    }
    return adopterProfile
  }

  static async getAdoptionContext ({ userId, petId }) {
    const query = `
      SELECT 
        (SELECT json_build_object(
          'phone_number', phone_number, 
          'address', address,
          'housing', housing,
          'other_pets', other_pets
        ) FROM adopter_profiles WHERE user_id = $1) as profile,
        (SELECT json_build_object(
          'status', status, 
          'at', created_at
        ) FROM adoption_requests WHERE user_id = $1 AND pet_id = $2) as application
    `

    const { rows } = await pool.query(query, [userId, petId])

    if (!rows[0].profile) return { has_profile: false }

    return {
      has_profile: true,
      profile: rows[0].profile,
      application: rows[0].application
    }
  }
}
