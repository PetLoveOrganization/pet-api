import { getFieldErrors } from '../utils.js'

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request',
      errors: getFieldErrors(result.error)
    })
  }
  req.body = result.data
  next()
}
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request',
      errors: getFieldErrors(result.error)
    })
  }
  req.validQuery = result.data
  next()
}
