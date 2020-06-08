'use strict'

class ValidationError extends Error {
  constructor (attributeErrors) {
    super()

    Error.captureStackTrace(this, ValidationError)

    this.attributeErrors = attributeErrors
    this.statusCode = 422
  }
}

module.exports = ValidationError
