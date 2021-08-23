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

Honeybadger.configure({
  apiKey: process.env.HONEYBADGER_API_KEY,
  environment: process.env.STAGE || 'development',
  filters: ['password', 'token']
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
