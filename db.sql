DROP TABLE IF EXISTS pet_adoption_requirements;
DROP TABLE IF EXISTS adoption_requirements;
DROP TABLE IF EXISTS pet_health_details;
DROP TABLE IF EXISTS pet_images;
DROP TABLE IF EXISTS pets;
-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   email TEXT NOT NULL UNIQUE,
--   password TEXT NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE TYPE levels AS ENUM ('low', 'medium', 'high', 'very high');
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE
  SET NULL,
    name VARCHAR(50) NOT NULL,
    species TEXT NOT NULL CHECK (
      species IN ('dog', 'cat', 'rabbit', 'bird', 'other')
    ),
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
    CONSTRAINT check_pet_vaccination_integrity CHECK (
      (
        is_vaccinated = false
        AND vaccines_updated_at = false
      )
      OR (
        is_vaccinated = true
        AND vaccines IS NOT NULL
        AND length(trim(vaccines)) > 0
      )
    ),
    CONSTRAINT check_sterilization_logic CHECK (
      (
        is_sterilized = false
        AND sterilization_date IS NULL
      )
      OR (is_sterilized = true)
    ),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE TABLE pet_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_unique_primary_image ON pet_images (pet_id)
WHERE (is_primary = true);
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
CREATE INDEX idx_pet_images_pet_id ON pet_images(pet_id);
CREATE INDEX idx_pets_user_id ON pets(user_id);
BEGIN;
-- 1. Catálogo de requisitos
INSERT INTO adoption_requirements (description, icon_name)
VALUES ('House with fenced yard', 'home'),
  ('Active lifestyle', 'run'),
  ('Time for daily walks', 'clock'),
  ('Previous experience required', 'shield'),
  ('No other pets in the house', 'alert-circle'),
  ('Commitment to follow-ups', 'clipboard-check') ON CONFLICT DO NOTHING;
-- 2. Inserción de Mascotas
DO $$
DECLARE user_id_val UUID := '8262367b-67a3-4aef-b2c6-1da860421951';
pid_kobe UUID;
pid_mora UUID;
pid_pipo UUID;
BEGIN -- KOBE (Perro)
INSERT INTO pets (
    user_id,
    name,
    species,
    breed,
    age,
    age_unit,
    size,
    color,
    gender,
    description,
    energy_level,
    affection_level,
    exercise_needs,
    location,
    recovery_fee,
    is_friendly,
    is_trained,
    is_urgent,
    is_sterilized,
    sterilization_date,
    is_vaccinated,
    vaccines_updated_at,
    vaccines,
    is_dewormed,
    dewormed_info
  )
VALUES (
    user_id_val,
    'Kobe',
    'dog',
    'Husky Mix',
    2,
    'years',
    'large',
    'Gray/White',
    'male',
    'Energetic and loyal companion, loves outdoor adventures.',
    'very high',
    'high',
    'very high',
    'San Francisco',
    150.00,
    true,
    true,
    true,
    true,
    '2025-06-15',
    true,
    true,
    'Rabies, DHPP, Lepto',
    true,
    'Quarterly'
  )
RETURNING id INTO pid_kobe;
-- MORA (Gata) - Corregida: Se eliminó el "true" extra al final
INSERT INTO pets (
    user_id,
    name,
    species,
    breed,
    age,
    age_unit,
    size,
    color,
    gender,
    description,
    energy_level,
    affection_level,
    exercise_needs,
    location,
    recovery_fee,
    is_friendly,
    is_urgent,
    is_sterilized,
    sterilization_date,
    is_vaccinated,
    vaccines_updated_at,
    vaccines
  )
VALUES (
    user_id_val,
    'Mora',
    'cat',
    'Siamese',
    6,
    'months',
    'small',
    'Cream',
    'female',
    'Sweet and talkative kitten. Loves to snuggle.',
    'medium',
    'very high',
    'low',
    'Seattle',
    75.00,
    true,
    false,
    false,
    NULL,
    true,
    false,
    'FVRCP (Core feline vaccine)'
  )
RETURNING id INTO pid_mora;
-- PIPO (Conejo)
INSERT INTO pets (
    user_id,
    name,
    species,
    breed,
    age,
    age_unit,
    size,
    color,
    gender,
    description,
    energy_level,
    affection_level,
    exercise_needs,
    location,
    recovery_fee,
    is_sterilized,
    is_vaccinated,
    vaccines_updated_at
  )
VALUES (
    user_id_val,
    'Pipo',
    'rabbit',
    'Holland Lop',
    1,
    'years',
    'small',
    'Brown',
    'male',
    'Quiet and gentle. Enjoys fresh hay.',
    'low',
    'medium',
    'medium',
    'Portland',
    40.00,
    false,
    false,
    false
  )
RETURNING id INTO pid_pipo;
-- 3. Imágenes
INSERT INTO pet_images (pet_id, image_url, is_primary)
VALUES (
    pid_kobe,
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8',
    true
  ),
  (
    pid_mora,
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    true
  ),
  (
    pid_pipo,
    'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308',
    true
  );
ALTER TABLE pet_images
ADD CONSTRAINT pet_image_url_unique UNIQUE (pet_id, image_url);
ALTER TABLE pet_adoption_requirements
ADD CONSTRAINT pet_req_unique UNIQUE (pet_id, requirement_id);
-- 4. Requisitos (3 por mascota)
INSERT INTO pet_adoption_requirements (pet_id, requirement_id)
SELECT pid_kobe,
  id
FROM adoption_requirements
WHERE description IN (
    'House with fenced yard',
    'Active lifestyle',
    'Time for daily walks'
  );
INSERT INTO pet_adoption_requirements (pet_id, requirement_id)
SELECT pid_mora,
  id
FROM adoption_requirements
WHERE description IN (
    'No other pets in the house',
    'Commitment to follow-ups',
    'Previous experience required'
  );
INSERT INTO pet_adoption_requirements (pet_id, requirement_id)
SELECT pid_pipo,
  id
FROM adoption_requirements
WHERE description IN (
    'No other pets in the house',
    'Previous experience required',
    'Commitment to follow-ups'
  );
END $$;
COMMIT;
DELETE FROM adoption_requirements
WHERE id > 6;
CREATE TYPE type_house AS ENUM ('apartment', 'house', 'house with a patio');
CREATE TABLE adapter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  type_house type_house NOT NULL,
  more_pets TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);