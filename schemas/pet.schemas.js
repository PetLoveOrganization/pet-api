import z from 'zod'

const level = (label) => {
  return z.enum(['low', 'medium', 'high', 'very high'], {
    invalid_type_error: `${label} must be one of low, medium, high, very high`,
    required_error: `${label} is required`
  })
}

const imageSchema = z.any()
  .refine((file) => file?.size <= 5 * 1024 * 1024, 'Each photo must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file?.mimetype),
    'Only JPG, PNG and WEBP formats are allowed'
  )

const petSchema = z.object({
  id: z.uuid().optional(),
  user_id: z.uuid().optional(),
  name: z.string({
    invalid_type_error: 'Pet name must be a string',
    required_error: 'Pet name is required'
  }).max(50, 'Pet name must be at most 50 characters'),
  species: z.enum(['dog', 'cat', 'rabbit', 'bird', 'other'], {
    invalid_type_error: 'Species must be one of dog, cat, rabbit, bird, other',
    required_error: 'Species is required'
  }),
  breed: z.string({
    invalid_type_error: 'Breed must be a string',
    required_error: 'Breed is required'
  }).max(50, 'Breed must be at most 50 characters'),
  age: z.coerce.number().int().min(0).max(99),
  age_unit: z.enum(['years', 'months'], {
    invalid_type_error: 'Age unit must be one of years, months',
    required_error: 'Age unit is required'
  }),
  size: z.enum(['small', 'medium', 'large'], {
    invalid_type_error: 'Size must be one of small, medium, large',
    required_error: 'Size is required'
  }),
  color: z.string({
    invalid_type_error: 'Color must be a string',
    required_error: 'Color is required'
  }).max(50, 'Color must be at most 50 characters'),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Gender must be one of male, female',
    required_error: 'Gender is required'
  }),
  description: z.string({
    invalid_type_error: 'Description must be a string',
    required_error: 'Description is required'
  }).max(500, 'Description must be at most 500 characters'),
  location: z.string({
    invalid_type_error: 'Location must be a string',
    required_error: 'Location is required'
  }).max(50, 'Location must be at most 50 characters'),
  recovery_fee: z.coerce.number().min(0),

  // Health
  is_sterilized: z.coerce.boolean(),
  sterilization_date: z.coerce.date().nullable(),
  is_vaccinated: z.coerce.boolean(),
  vaccines_updated_at: z.coerce.boolean(),
  vaccines: z.string().nullable(),
  is_dewormed: z.coerce.boolean().default(false),
  dewormed_info: z.string().default('monthly'),

  // States
  is_friendly: z.coerce.boolean(),
  is_trained: z.coerce.boolean(),
  is_urgent: z.coerce.boolean(),
  is_adopted: z.coerce.boolean(),

  // Levels
  energy_level: level('Energy level'),
  affection_level: level('Affection level'),
  exercise_needs: level('Exercise needs'),

  created_at: z.date().optional(),
  deleted_at: z.date().optional()
})

const petInputBase = petSchema.omit({
  id: true,
  is_adopted: true,
  created_at: true,
  deleted_at: true,
  user_id: true
}).extend({
  images: z.array(imageSchema).min(1, 'At least one image is required').max(5, 'At most 5 images are allowed'),
  primary_index: z.coerce.number().min(0).max(4).default(0),
  requirement_ids: z.array(z.coerce.number()).min(1, 'At least 1 requirement is needed')
})

const validateVaccination = (data) => {
  if (data.is_vaccinated === undefined) return true

  if (data.is_vaccinated) {
    return !!data.vaccines && data.vaccines.trim().length > 0
  }
  return !data.vaccines_updated_at && typeof data.vaccines !== 'string'
}

const validateSterilization = (data) => {
  if (data.is_sterilized === undefined) return true

  if (data.is_sterilized) {
    return data.sterilization_date !== null && data.sterilization_date !== undefined
  }
  return data.sterilization_date === null || data.sterilization_date === undefined
}

export const createPetSchema = petInputBase
  .refine(validateVaccination, {
    message: 'Vaccination consistency error',
    path: ['vaccines']
  })
  .refine(validateSterilization, {
    message: 'If is_sterilized is true, sterilization_date is required',
    path: ['sterilization_date']
  })

export const updatePetSchema = petInputBase
  .partial()
  .refine(validateVaccination, {
    message: 'Vaccination consistency error',
    path: ['vaccines']
  })
  .refine(validateSterilization, {
    message: 'If is_sterilized is true, sterilization_date is required',
    path: ['sterilization_date']
  })
