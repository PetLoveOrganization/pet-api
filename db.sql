DROP TABLE IF EXISTS pet_adoption_requirements;
DROP TABLE IF EXISTS adoption_requirements;
DROP TABLE IF EXISTS pet_health_details;
DROP TABLE IF EXISTS pet_images;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TYPE levels AS ENUM ('low', 'medium', 'high', 'very high');
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
  public_id TEXT NOT NULL,
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
CREATE TYPE housing_type AS ENUM ('apartment', 'house', 'patio');
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
CREATE TYPE adoption_request_status AS ENUM ('pending', 'approved', 'rejected');
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