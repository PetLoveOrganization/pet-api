import z from 'zod'
import { DEFAULTS } from '../config.js'

export const filtersSchema = z.object({
  species: z
    .preprocess((val) => {
      if (!val) return []
      return Array.isArray(val) ? val : [val]
    }, z.array(z.enum(['dog', 'cat', 'rabbit', 'bird', 'other'], {
      errorMap: () => ({ message: 'Species must be one of dog, cat, rabbit, bird, other' })
    })))
    .optional(),
  age: z.coerce.number().int().min(0).max(4),
  gender: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase()
    return val
  }, z.enum(['male', 'female'])),
  states: z.enum(['friendly', 'trained', 'urgent']),
  health: z.enum(['sterilized', 'vaccinated', 'dewormed']),
  text: z.string().toLowerCase().optional(),
  sortBy: z.enum(['latest', 'oldest']).optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number().int().min(0)
    )
    .default(DEFAULTS.LIMIT_OFFSET)
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number().int().min(1)
    )
    .default(DEFAULTS.LIMIT_PAGE)
    .optional()
})

export const limitOffsetSchema = z.object({
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number().int().min(0)
    )
    .default(DEFAULTS.LIMIT_OFFSET)
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number().int().min(1)
    )
    .default(DEFAULTS.LIMIT_PAGE)
    .optional()
})

export const AdoptionRequestSchema = limitOffsetSchema.extend({
  status: z.enum(['pending', 'approved', 'rejected'], 'The status must be one of pending, approved, rejected').optional()
})
