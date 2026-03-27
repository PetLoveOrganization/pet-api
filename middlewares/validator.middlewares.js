import { responseError } from '../utils/utils.js'
import fs from 'fs'

export const validateBody = (schema) => (req, res, next) => {
  const dataToValidate = {
    ...req.body,
    images: req.files || (req.file ? [req.file] : undefined)
  }
  const result = schema.safeParse(dataToValidate)
  if (!result.success) {
    const filesToDelete = req.files || (req.file ? [req.file] : [])

    filesToDelete.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Error deleting temporal file: ${file.path}`, err)
        })
      }
    })
    return res.status(400).json(responseError(result.error))
  }
  req.body = result.data
  next()
}

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json(responseError(result.error))
  }
  req.validQuery = result.data
  next()
}

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params)
  if (!result.success) {
    return res.status(400).json(responseError(result.error))
  }
  req.validParams = result.data
  next()
}
