'use strict'

const Honeybadger = require('honeybadger')
const HttpStatusCodes = require('http-status-codes')
const { Error } = require('jsonapi-serializer')
const { isFunction, isArray } = require('bima-shark-sdk')

const ApiResponse = require('./api-response')
const Logger = require('./logger')
const ValidationError = require('./validation-error')

/**
 * @class Controller
 * @classdesc Controller to Lambda handlers for API Gateway events
 *
 * @param {function} options.handler The event handler function
 * @param {function[]} options.beforeActions The event handler function
 *
 * @throws {Error} Parameter options.handler must be an function
 * @throws {Error} Parameter options.beforeActions must be an array
 */
class Controller {
  constructor (options = {}) {
    if (!isFunction(options.handler)) {
      throw new Error('Option `handler` is missing or not a function')
    }
    if (options.beforeActions && !isArray(options.beforeActions)) {
      throw new Error('Option `beforeActions` must be an array of functions')
    }

    this.handler = options.handler
    this.beforeActions = options.beforeActions || []
    this.logger = new Logger()
  }

  /**
   * @api public
   */
  async execute (event, context, callback) {
    const startTime = new Date()

    event.shark = {
      serviceToken: this.serviceToken(event)
    }

    let response
    try {
      // run before actions
      for (const action of this.beforeActions) {
        await action(event, context, callback)
      }

      // run business logic
      response = await this.handler(event, context, callback)
    } catch (error) {
      if (!error.statusCode) {
        console.log(error)
        this.notifyHoneybadger(event, error)
        error.statusCode = 500
      }
      const serializedError = this.serializedError(error)
      response = new ApiResponse(error.statusCode, serializedError)
    }

    this.logResponse(event, response, startTime)

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    }
  }

  /**
   * Log request / response information.
   *
   * @param {object} event
   * @param {ApiResponse} response
   * @param {Date} startTime
   */
  logResponse (event, response, startTime) {
    const duration = new Date() - startTime
    let contentLength = 0

    if (isFunction(response.contentLength)) {
      contentLength = response.contentLength()
    }

    this.logger.info({
      url: event.path,
      method: event.httpMethod,
      params: event.queryStringParameters,
      status: response.statusCode,
      length: contentLength,
      duration: `${duration}ms`
    })
  }

  notifyHoneybadger (event, error) {
    Honeybadger.notify(error, {
      url: event.path,
      method: event.httpMethod,
      params: event.queryStringParameters
    })
  }

  serializedError (error) {
    if (error instanceof ValidationError) {
      return new Error(error.attributeErrors)
    }

    return new Error({
      code: error.errorCode || '',
      status: error.statusCode,
      title: HttpStatusCodes.getStatusText(error.statusCode),
      detail: error.message
    })
  }

  serviceToken (event) {
    if (!event.headers) { return }

    const authorizationHeader = event.headers.Authorization || event.headers.authorization
    if (!authorizationHeader) { return }

    return authorizationHeader.replace(/^Bearer\s+/i, '')
  }
}

module.exports = Controller
