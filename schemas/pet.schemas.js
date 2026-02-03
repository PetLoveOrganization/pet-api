import z from 'zod'

export const petSchema = z.object({
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
  images: z.array(z.string(), {
    invalid_type_error: 'Images must be an array of strings',
    required_error: 'Images is required'
  }),
  is_urgent: z.boolean(),
  is_friendly: z.boolean(),
  is_trained: z.boolean(),
  is_vaccinated: z.boolean(),
  is_neutered: z.boolean(),
  energy_level: z.enum(['low', 'medium', 'high'], {
    invalid_type_error: 'Energy level must be one of low, medium, high',
    required_error: 'Energy level is required'
  }),
  location: z.string({
    invalid_type_error: 'Location must be a string',
    required_error: 'Location is required'
  }).max(50, 'Location must be at most 50 characters')
})
