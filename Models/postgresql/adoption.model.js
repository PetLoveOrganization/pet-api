import { pool } from './db.js'

export class AdoptionModel {
  static async createAdoptionFull ({ userId, input }) {
    const { pet_id, motivation, phone_number, address, housing, other_pets } = input
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const upsertProfileQuery = `
      INSERT INTO adopter_profiles (user_id, phone_number, address, housing, other_pets )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        phone_number = EXCLUDED.phone_number,
        address = EXCLUDED.address,
        housing = EXCLUDED.housing,
        other_pets = EXCLUDED.other_pets,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `
      const profileResult = await client.query(upsertProfileQuery, [userId, phone_number, address, housing, other_pets])

      const insertRequestQuery = `
      INSERT INTO adoption_requests (user_id, pet_id, motivation)
      VALUES ($1, $2, $3)
      RETURNING *;
    `
      const requestResult = await client.query(insertRequestQuery, [userId, pet_id, motivation])

      await client.query('COMMIT')
      return {
        profile: profileResult.rows[0],
        request: requestResult.rows[0]
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
