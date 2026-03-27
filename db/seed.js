import { pool } from '../config/db.js' // Asegúrate de que el SSL esté en false en tu config.js
import bcrypt from 'bcrypt'

const seedDatabase = async () => {
  const client = await pool.connect()

  try {
    const res = await client.query('SELECT current_database()')
    console.log('--- Conectado a la base de datos: ---', res.rows[0].current_database)
    await client.query('BEGIN')

    console.log('--- 1. Limpiando Base de Datos ---')
    await client.query(`
      DROP TABLE IF EXISTS favorites, adoption_requests, adopter_profiles, 
      pet_adoption_requirements, adoption_requirements, 
      pet_images, pets, users CASCADE;
      DROP TYPE IF EXISTS levels, housing_type, adoption_request_status CASCADE;
    `)

    console.log('--- 2. Creando Tipos y Tablas ---')
    await client.query(`
      CREATE TYPE levels AS ENUM ('low', 'medium', 'high', 'very high');
      CREATE TYPE housing_type AS ENUM ('apartment', 'house', 'patio');
      CREATE TYPE adoption_request_status AS ENUM ('pending', 'approved', 'rejected');

      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(50) NOT NULL,
        species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'rabbit', 'bird', 'other')),
        breed VARCHAR(50) NOT NULL,
        age INT NOT NULL CHECK (age >= 0),
        age_unit TEXT NOT NULL CHECK (age_unit IN ('years', 'months')),
        size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
        color VARCHAR(50) NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        description VARCHAR(500) NOT NULL,
        is_friendly BOOLEAN NOT NULL DEFAULT false,
        is_trained BOOLEAN NOT NULL DEFAULT false,
        is_urgent BOOLEAN NOT NULL DEFAULT false,
        is_adopted BOOLEAN NOT NULL DEFAULT false,
        energy_level levels NOT NULL,
        affection_level levels NOT NULL,
        exercise_needs levels NOT NULL,
        location VARCHAR(50) NOT NULL,
        recovery_fee NUMERIC(10, 2) NOT NULL,
        is_sterilized BOOLEAN NOT NULL DEFAULT false,
        sterilization_date DATE,
        is_vaccinated BOOLEAN NOT NULL DEFAULT false,
        vaccines_updated_at BOOLEAN DEFAULT false,
        vaccines TEXT,
        is_dewormed BOOLEAN NOT NULL DEFAULT false,
        dewormed_info TEXT NOT NULL DEFAULT 'monthly',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT check_pet_vaccination_integrity CHECK (
          (is_vaccinated = false AND vaccines_updated_at = false) OR 
          (is_vaccinated = true AND vaccines IS NOT NULL AND length(trim(vaccines)) > 0)
        )
      );

      CREATE TABLE pet_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        public_id TEXT NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX idx_unique_primary_image ON pet_images (pet_id) WHERE (is_primary = true);

      CREATE TABLE adoption_requirements (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        icon_name TEXT
      );

      CREATE TABLE pet_adoption_requirements (
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        requirement_id INTEGER REFERENCES adoption_requirements(id) ON DELETE CASCADE,
        PRIMARY KEY (pet_id, requirement_id)
      );
      CREATE INDEX IF NOT EXISTS idx_pet_images_pet_id ON pet_images(pet_id);
      CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
      CREATE TABLE adopter_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        phone_number VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        housing housing_type NOT NULL,
        other_pets TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_profile UNIQUE (user_id)
      );
      CREATE TABLE adoption_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        status adoption_request_status NOT NULL DEFAULT 'pending',
        motivation TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_pet_request UNIQUE (user_id, pet_id)
      );
      CREATE TABLE favorites (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, pet_id)
      );
    `)

    console.log('--- 3. Creando Usuario Roman ---')
    const hashedPassword = await bcrypt.hash('Roman123.', 10)
    const userRes = await client.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      ['Roman', 'roman@gmail.com', hashedPassword]
    )
    const userId = userRes.rows[0].id

    console.log('--- 4. Insertando Requisitos de Adopción ---')
    const reqsRes = await client.query(`
      INSERT INTO adoption_requirements (description, icon_name)
      VALUES 
        ('House with fenced yard', 'home'),
        ('Active lifestyle', 'run'),
        ('Time for daily walks', 'clock'),
        ('Previous experience required', 'shield'),
        ('No other pets in the house', 'alert-circle'),
        ('Commitment to follow-ups', 'clipboard-check')
      RETURNING id, description
    `)
    const reqMap = reqsRes.rows.reduce((acc, row) => {
      acc[row.description] = row.id
      return acc
    }, {})

    console.log('--- 5. Insertando Mascotas (Kobe, Mora, Pipo) ---')

    // KOBE
    const kobeRes = await client.query(`
      INSERT INTO pets (
        user_id, name, species, breed, age, age_unit, size, color, gender, 
        description, is_friendly, is_trained, is_urgent, is_adopted, 
        energy_level, affection_level, exercise_needs, location, recovery_fee, 
        is_sterilized, sterilization_date, is_vaccinated, vaccines_updated_at, 
        vaccines, is_dewormed, dewormed_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id`,
    [userId, 'Kobe', 'dog', 'Husky Mix', 2, 'years', 'large', 'Gray/White', 'male', 'Energetic and loyal companion.', true, true, true, false, 'very high', 'high', 'very high', 'San Francisco', 150.00, true, '2025-06-15', true, true, 'Rabies, DHPP, Lepto', true, 'Quarterly']
    )

    // MORA
    const moraRes = await client.query(`
      INSERT INTO pets (
        user_id, name, species, breed, age, age_unit, size, color, gender, 
        description, is_friendly, is_trained, is_urgent, is_adopted, 
        energy_level, affection_level, exercise_needs, location, recovery_fee, 
        is_sterilized, sterilization_date, is_vaccinated, vaccines_updated_at, 
        vaccines, is_dewormed, dewormed_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id`,
    [userId, 'Mora', 'cat', 'Siamese', 6, 'months', 'small', 'Cream', 'female', 'Sweet and talkative kitten.', true, false, false, false, 'medium', 'very high', 'low', 'Seattle', 75.00, false, null, true, true, 'FVRCP (Core feline vaccine)', true, 'monthly']
    )

    // PIPO
    const pipoRes = await client.query(`
      INSERT INTO pets (
        user_id, name, species, breed, age, age_unit, size, color, gender, 
        description, is_friendly, is_trained, is_urgent, is_adopted, 
        energy_level, affection_level, exercise_needs, location, recovery_fee, 
        is_sterilized, sterilization_date, is_vaccinated, vaccines_updated_at, 
        vaccines, is_dewormed, dewormed_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id`,
    [userId, 'Pipo', 'rabbit', 'Holland Lop', 1, 'years', 'small', 'Brown', 'male', 'Quiet and gentle.', true, false, false, false, 'low', 'medium', 'medium', 'Portland', 40.00, false, null, false, false, null, false, 'none']
    )

    const pids = { kobe: kobeRes.rows[0].id, mora: moraRes.rows[0].id, pipo: pipoRes.rows[0].id }

    console.log('--- 6. Insertando Imágenes ---')
    const images = [
      [pids.kobe, 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8', 'static_kobe', true],
      [pids.mora, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', 'static_mora', true],
      [pids.pipo, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308', 'static_pipo', true]
    ]

    for (const img of images) {
      await client.query('INSERT INTO pet_images (pet_id, image_url, public_id, is_primary) VALUES ($1, $2, $3, $4)', img)
    }

    console.log('--- 7. Vinculando Requisitos ---')
    const associations = [
      { pid: pids.kobe, r: ['House with fenced yard', 'Active lifestyle', 'Time for daily walks'] },
      { pid: pids.mora, r: ['No other pets in the house', 'Commitment to follow-ups', 'Previous experience required'] },
      { pid: pids.pipo, r: ['No other pets in the house', 'Previous experience required', 'Commitment to follow-ups'] }
    ]

    for (const item of associations) {
      for (const rDesc of item.r) {
        await client.query('INSERT INTO pet_adoption_requirements (pet_id, requirement_id) VALUES ($1, $2)', [item.pid, reqMap[rDesc]])
      }
    }

    await client.query('COMMIT')
    console.log('✅ Base de datos recreada y sembrada con éxito.')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error sembrando la BD:', error)
  } finally {
    client.release()
    process.exit()
  }
}

seedDatabase()
