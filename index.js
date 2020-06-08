'use strict'

const Honeybadger = require('honeybadger')

const ApiError = require('./src/api-error')
const ValidationError = require('./src/validation-error')
const ApiResponse = require('./src/api-response')
const Config = require('./src/config')
const RequestHandlerBuilder = require('./src/request-handler-builder')

const authenticate = require('./src/authenticate')
const authorize = require('./src/authorize')
const buildHandler = require('./src/build-handler')

/**
 * Configure Honeybadger
 */
function honeybadgerEnvironment () {
  const value = process.env.SLS_STAGE

  switch (value) {
    case 'develop':
      return 'development'
    case 'integration':
    case 'staging':
    case 'production':
      return value
    default:
      return 'unknown'
  }
}

Honeybadger.configure({
  apiKey: process.env.HB_API_KEY,
  environment: honeybadgerEnvironment(),
  filters: ['password', 'token']
})

Honeybadger.setContext({
  tags: process.env.SLS_SERVICE || 'Shark on Lambda'
})

module.exports = {
  ApiResponse,
  ApiError,
  ValidationError,
  RequestHandlerBuilder,

  authenticate,
  authorize,
  buildHandler,

  /**
   * @return {Object} The SharkOnLambda configuration
   */
  config: Config,

  /**
   * Merge options into the SharkOnLambda configuration.
   *
   * @param {Object} [options] The options you want to pass
   */
  configure: (options) => {
    Object.assign(Config, options)
  }
}
