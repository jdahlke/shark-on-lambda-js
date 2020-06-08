'use strict'

class ApiError extends Error {
  constructor (statusCode, ...options) {
    super(...options)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }

    this.statusCode = statusCode
  }
}

module.exports = ApiError
