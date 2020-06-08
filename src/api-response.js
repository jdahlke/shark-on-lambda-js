'use strict'

const { isString } = require('bima-shark-sdk')

/**
 * @class ApiResponse
 * @classdesc Simple class for AWS API Gateway responses.
 *
 * @param {number} statusCode the HTTP status as an integer
 * @param {object} body       the body of the HTTP response
 * @param {object} options
 *   - headers {object}
 */
class ApiResponse {
  constructor (statusCode, body, options = {}) {
    this.statusCode = statusCode
    this.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': true
    }
    this.body = null

    if (body) {
      this.body = isString(body) ? body : JSON.stringify(body)
    }

    // add additional headers
    Object.keys(options.headers || {}).forEach(name => {
      const value = options.headers[name]
      this.headers[name.toLowerCase()] = value
    })
  }

  contentLength () {
    if (this.body) {
      return this.body.length
    }

    return 0
  }
}

module.exports = ApiResponse
