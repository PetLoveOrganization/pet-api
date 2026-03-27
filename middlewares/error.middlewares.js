import multer from 'multer'

export const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode = err.status || 500
  let message = err.message || 'Internal Server Error'

  if (err instanceof multer.MulterError) {
    statusCode = 400
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded'
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'File count limit exceeded'
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file'
    }
  }

  if (err.code === '23505') {
    statusCode = 409
    message = 'El registro ya existe (Dato duplicado).'
  }

  if (err.code === '23503') {
    statusCode = 400
    message = 'No se puede completar la acción porque este registro está relacionado con otro.'
  }

  console.error(`[ERROR]: ${err.code} - ${message}`)

  res.status(statusCode).json({
    status: 'error',
    message
  })
}
