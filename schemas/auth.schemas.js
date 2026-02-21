import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.email('Invalid email'),
  password: z
    .string()
    .min(6, 'Minimum 6 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character')
})

export const refreshSchema = z.object({
  refreshToken: z.string()
})
