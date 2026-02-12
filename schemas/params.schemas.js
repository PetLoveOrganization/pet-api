import { z } from 'zod'

export const paramsSchema = z.object({
  id: z.uuid('Invalid ID')
})
