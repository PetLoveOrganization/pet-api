import z from 'zod'

export const adapterProfileSchema = z.object({
  phone_number: z.string().min(10).max(20),
  address: z.string().min(10).max(200),
  type_house: z.enum(['apartment', 'house', 'house with a patio']),
  more_pets: z.string()
})
