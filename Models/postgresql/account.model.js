import { pool } from '../../config/db.js'

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
    const { rows } = await pool.query('SELECT phone_number, address, housing, other_pets, created_at, updated_at FROM adopter_profiles WHERE user_id = $1', [id])
    const adopterProfile = rows[0]
    if (!adopterProfile) {
      return null
    }
    return adopterProfile
  }

  static async updateAdapterProfile ({ id, input }) {
    const fields = Object.keys(input)
    const query = `
      UPDATE adopter_profiles 
      SET ${fields.map((field, index) => `${field} = $${index + 2}`).join(', ')}
      WHERE user_id = $1
      RETURNING phone_number, address, housing, other_pets, created_at, updated_at
    `
    const { rows } = await pool.query(query, [id, ...Object.values(input)])
    return rows[0]
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

  static async getAdoptionRequests ({ userId, validQuery }) {
    const { offset, limit, status } = validQuery
    const where = []
    const queryParams = [userId]
    if (status) {
      where.push(`status = $${queryParams.length + 1}`)
      queryParams.push(status)
    }
    const query = `
      SELECT 
        ar.id,
        ar.status,
        ar.created_at,
        to_jsonb(p) || jsonb_build_object(
          'images', COALESCE(
            (SELECT json_agg(json_build_object(
              'image_url', pi.image_url,
              'is_primary', pi.is_primary
            )) FROM pet_images pi WHERE pi.pet_id = p.id AND pi.is_primary = true),
            '[]'::json
          )
        ) AS pet,
        COUNT(*) OVER() AS full_count
      FROM pets p
      JOIN adoption_requests ar ON p.id = ar.pet_id 
      WHERE ar.user_id = $1 ${where.length > 0 ? `AND ${where.join(' AND ')}` : ''} AND p.deleted_at IS NULL
      GROUP BY p.id, ar.id
      ORDER BY ar.created_at DESC
      OFFSET $${queryParams.length + 1}
      LIMIT $${queryParams.length + 2}
    `
    const { rows } = await pool.query(query, [...queryParams, offset, limit])
    const total = rows.length > 0 ? parseInt(rows[0].full_count) : 0
    const cleanData = rows.map(({ full_count, ...petData }) => petData)
    return {
      data: cleanData,
      total,
      offset,
      limit
    }
  }
}
