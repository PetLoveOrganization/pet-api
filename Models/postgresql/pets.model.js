import { pool } from './db.js'
// import crypto from 'node:crypto'
import { AgeUnit, PetAges } from '../../type.d.js'
export class PetsModel {
  static async getAll ({ text, species, age, gender, actions, sortBy, offset, limit }) {
    const where = []
    const queryParams = []
    if (text) {
      where.push(`name ILIKE $${queryParams.length + 1}`)
      queryParams.push(`%${text}%`)
    }
    if (species) {
      where.push(`species = ANY($${queryParams.length + 1})`)
      queryParams.push(species)
    }
    if (age != null) {
      if (age === 0) {
        where.push(`(age_unit = $${queryParams.length + 1} OR (age_unit = $${queryParams.length + 2} AND age BETWEEN $${queryParams.length + 3} AND $${queryParams.length + 4}))`)
        queryParams.push(AgeUnit.MONTHS)
        queryParams.push(AgeUnit.YEARS)
        queryParams.push(PetAges[age][0])
        queryParams.push(PetAges[age][1])
      } else {
        where.push(`age_unit = $${queryParams.length + 1} AND age BETWEEN $${queryParams.length + 2} AND $${queryParams.length + 3}`)
        queryParams.push(AgeUnit.YEARS)
        queryParams.push(PetAges[age][0])
        queryParams.push(PetAges[age][1])
      }
    }
    if (gender) {
      where.push(`gender = $${queryParams.length + 1}`)
      queryParams.push(gender)
    }
    if (actions) {
      const bdActionColum = `is_${actions}`
      where.push(`${bdActionColum} = $${queryParams.length + 1}`)
      queryParams.push(true)
    }
    const isAsc = sortBy === 'oldest'
    const query = `
    SELECT 
      p.*, 
      (SELECT JSON_AGG(pi.image_url) FROM pet_images pi WHERE pi.pet_id = p.id AND pi.is_primary = true) AS images 
    FROM pets p  
    ${where.length > 0 ? `WHERE ${where.join(' AND ')} AND p.deleted_at IS NULL` : 'WHERE p.deleted_at IS NULL'} 
    GROUP BY p.id 
    ORDER BY created_at ${isAsc ? 'ASC' : 'DESC'} 
    LIMIT $${queryParams.length + 1} 
    OFFSET $${queryParams.length + 2}`
    const { rows: pets } = await pool.query(query, [...queryParams, limit, offset])
    return {
      data: pets,
      total: pets.length,
      offset,
      limit
    }
  }

  static async getById ({ id }) {
    const { rows: [pet] } = await pool.query(`
      SELECT 
        p.*, 
        (SELECT JSON_AGG(pi.image_url) FROM pet_images pi WHERE pi.pet_id = p.id) AS images, 
        json_build_object(  
          'id', u.id, 
          'name', u.name, 
          'email', u.email
        ) AS owner,
        (SELECT json_agg(r.description) 
          FROM adoption_requirements r 
          JOIN pet_adoption_requirements par ON r.id = par.requirement_id 
          WHERE par.pet_id = p.id) AS requirements 
      FROM pets p 
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN pet_health_details h ON p.id = h.pet_id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, u.id
      
    `, [id])
    if (!pet) {
      return null
    }
    return pet
  }

  static async create ({ input }) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const { images, requirement_ids, name, user_id, species, breed, age, age_unit, size, color, gender, description, location, recovery_fee, is_sterilized, sterilization_date, is_vaccinated, vaccines_updated_at, vaccines, is_dewormed, dewormed_info, is_friendly, is_trained, is_urgent, energy_level, affection_level, exercise_needs } = input
      const { rows } = await client.query('INSERT INTO pets (name,user_id, species, breed, age, age_unit, size, color, gender, description, location, recovery_fee, is_sterilized, sterilization_date, is_vaccinated, vaccines_updated_at, vaccines, is_dewormed, dewormed_info, is_friendly, is_trained, is_urgent, energy_level, affection_level, exercise_needs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *', [name, user_id, species, breed, age, age_unit, size, color, gender, description, location, recovery_fee, is_sterilized, sterilization_date, is_vaccinated, vaccines_updated_at, vaccines, is_dewormed, dewormed_info, is_friendly, is_trained, is_urgent, energy_level, affection_level, exercise_needs])
      if (images) {
        const imgValues = []
        const placeholders = images.map((image, index) => {
          const offset = index * 3
          imgValues.push(rows[0].id, image.image_url, image.is_primary)
          return `($${offset + 1}, $${offset + 2}, $${offset + 3})`
        }).join(', ')
        await client.query(`INSERT INTO pet_images (pet_id, image_url, is_primary) VALUES ${placeholders}`, imgValues)
      }
      if (requirement_ids) {
        const reqValues = []
        const placeholders = requirement_ids.map((req_id, index) => {
          const offset = index * 2
          reqValues.push(rows[0].id, req_id)
          return `($${offset + 1}, $${offset + 2})`
        }).join(', ')
        await client.query(`INSERT INTO pet_adoption_requirements (pet_id, requirement_id) VALUES ${placeholders}`, reqValues)
      }
      await client.query('COMMIT')
      return {
        ...rows[0],
        images,
        requirements: requirement_ids
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  static async update ({ id, input }) {
    const client = await pool.connect()
    const { images, ...rest } = input
    try {
      await client.query('BEGIN')
      if (Object.keys(rest).length === 0) {
        throw new Error('No data provided')
      }
      const fields = Object.keys(rest)
      const values = Object.values(rest)
      const queryParams = [...values, id]
      const query = `UPDATE pets SET ${fields.map((field, index) => `${field} = $${index + 1}`).join(', ')} WHERE id = $${fields.length + 1} RETURNING *`
      const { rows } = await client.query(query, queryParams)
      if (rows.length === 0) {
        return null
      }
      if (images) {
        await client.query('DELETE FROM pet_images WHERE pet_id = $1', [id])
        const imgValues = []
        const placeholders = images.map((url, index) => {
          const offset = index * 2
          imgValues.push(rows[0].id, url)
          return `($${offset + 1}, $${offset + 2}, ${index === 0})`
        }).join(', ')
        await client.query(`INSERT INTO pet_images (pet_id, image_url, is_primary) VALUES ${placeholders}`, imgValues)
      }
      const { rows: imagesRows } = await client.query('SELECT * FROM pet_images WHERE pet_id = $1', [id])
      await client.query('COMMIT')
      return {
        ...rows[0],
        images: imagesRows.map(image => image.image_url)
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  static async delete ({ id }) {
    const client = await pool.connect()
    const { rows } = await client.query('DELETE FROM pets WHERE id = $1 RETURNING *', [id])
    if (rows.length === 0) {
      return null
    }
    return rows[0]
  }
}
