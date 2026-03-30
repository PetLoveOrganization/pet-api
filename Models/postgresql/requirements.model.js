import { pool } from '../../config/db.js'

export class RequirementsModel {
  static async getAll () {
    const query = `
      SELECT * FROM adoption_requirements;
    `
    const result = await pool.query(query)
    return result.rows
  }
}
