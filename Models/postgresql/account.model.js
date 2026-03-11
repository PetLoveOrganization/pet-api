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

  static async toggleFavorite ({ userId, petId }) {
    const query = `
      WITH deleted AS (
        DELETE FROM favorites
        WHERE user_id = $1 AND pet_id = $2
        RETURNING *
      ),
      inserted AS (
        INSERT INTO favorites (user_id, pet_id)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM deleted)
        RETURNING *
      )
      SELECT EXISTS (SELECT 1 FROM inserted) as "isFavorite";
    `
    const { rows } = await pool.query(query, [userId, petId])
    return rows[0]
  }

  static async getFavoritePets ({ userId, validQuery }) {
    const { offset, limit } = validQuery
    const query = `
      SELECT *, (SELECT JSON_AGG(json_build_object(
        'image_url', pi.image_url,
        'is_primary', pi.is_primary
      )) FROM pet_images pi WHERE pi.pet_id = p.id AND pi.is_primary = true) AS images,
      COUNT(*) OVER() AS full_count
      FROM pets p 
      WHERE p.id IN (
        SELECT pet_id FROM favorites WHERE user_id = $1
      ) AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      OFFSET $2
      LIMIT $3
    `
    const { rows } = await pool.query(query, [userId, offset, limit])
    const total = rows.length > 0 ? parseInt(rows[0].full_count) : 0
    return {
      data: rows,
      total,
      offset,
      limit
    }
  }

  static async getFavoriteIds ({ userId }) {
    const query = `
      SELECT pet_id FROM favorites WHERE user_id = $1
    `
    const { rows } = await pool.query(query, [userId])
    return rows.map(row => row.pet_id)
  }
}
