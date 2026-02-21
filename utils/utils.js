import z from 'zod'

export const getFieldErrors = (error) => {
  return z.flattenError(error).fieldErrors
}

export const responseError = (error) => {
  return {
    status: 'error',
    message: 'Invalid request',
    errors: getFieldErrors(error)
  }
}
