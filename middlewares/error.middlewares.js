export const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode = err.status || 500
  let message = err.message || 'Internal Server Error'

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
