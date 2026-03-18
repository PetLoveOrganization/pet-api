import z from 'zod'

export const adapterProfileSchema = z.object({
  phone_number: z.string().min(10, { message: 'Phone number must be at least 10 characters long' }).max(20, { message: 'Phone number must be at most 20 characters long' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters long' }).max(200, { message: 'Address must be at most 200 characters long' }),
  housing: z.enum(['apartment', 'house', 'patio'], { invalid_type_error: 'Invalid housing type' }),
  other_pets: z.string().optional()
})

export const adoptionRequestSchema = adapterProfileSchema.extend({
  pet_id: z.uuid({ message: 'Invalid pet ID' }),
  motivation: z.string().min(10, { message: 'Motivation must be at least 10 characters long' }).max(200, { message: 'Motivation must be at most 200 characters long' })
})
