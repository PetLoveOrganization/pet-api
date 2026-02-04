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
  is_vaccinated BOOLEAN NOT NULL DEFAULT false,
  is_neutered BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  is_adopted BOOLEAN NOT NULL DEFAULT false,
  energy_level TEXT NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
  location VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pet_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM pets;
SELECT * FROM pet_images;

DELETE FROM pet_images;
DELETE FROM pets;

ALTER TABLE pets ADD COLUMN is_urgent BOOLEAN NOT NULL DEFAULT false; 