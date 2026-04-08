export const DEFAULTS = {
  LIMIT_OFFSET: 0,
  LIMIT_PAGE: 5,
  ACCESS_TOKEN_EXPIRY: '1d',
  REFRESH_TOKEN_EXPIRY: '7d',
  MAX_AGE_ACCESS_TOKEN: 1 * 24 * 60 * 60 * 1000,
  MAX_AGE_REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000
}

export const {
  PORT = 4000,
  SALT_ROUNDS = 10,
  JWT_SECRET = 'this_is_an_awesome_secret_key_for_jwt_signing_and_encryption',
  REFRESH_SECRET = 'this_is_an_awesome_secret_key_for_refresh_signing_and_encryption'
} = process.env
