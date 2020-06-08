'use strict'

const { isArray, isObject, isFunction } = require('bima-shark-sdk')

const buildHandler = require('./build-handler')

/**
 * @class RequestHandlerBuilder
 * @classdesc Builder class to create Lambda handlers for API Gateway events.
 *
 * @param {Object} functions An object containing the handler functions
 *
 * @example
 * const { authenticate, RequestHandlerBuilder, ApiResponse } = require('bima-shark-on-lambda')
 *
 * async function create (event, context, callback) {
 *   return new ApiResponse(201, body)
 * }
 *
 * const builder = new RequestHandlerBuilder()
 * builder.addHandlers({ create })
 * builder.addBeforeAction(authenticate)
 *
 * module.exports = builder.handlers()
 */
class RequestHandlerBuilder {
  constructor (functions) {
    this.configuration = {}
    if (functions) { this.addHandlers(functions) }
  }

  /**
   * @param {object} functions An object containing the handler functions
   */
  addHandlers (functions) {
    const functionNames = Object.keys(functions)

    functionNames.forEach(name => {
      this.configuration[name] = {
        handler: functions[name],
        before: []
      }
    })
  }

  /**
   * @param {function} beforeAction Before action function
   * @param {Object} [options]
   * @param {array} [options.only] Name of handlers
   * @param {array} [options.except] Name of handlers
   *
   * @throws {Error} Parameter `beforeAction` must be a function
   * @throws {Error} `only` and `except` keys in `options` parameter cannot be used together
   * @throws {Error} `only` key in `options` parameter must be an array and contain existing handlers if set
   * @throws {Error} `except` key in `options` parameter must be an array and contain existing handlers if set
   */
  addBeforeAction (beforeAction, options = {}) {
    if (!isFunction(beforeAction)) {
      throw new Error('Parameter `beforeAction` is missing or not a function')
    }

    if (!isObject(options) || isArray(options)) {
      throw new Error('Parameter `options` is not an Object or is an array')
    }

    if (hasOwnProperty(options, 'only') && hasOwnProperty(options, 'except')) {
      throw new Error('`only` and `except` keys cannot be used together in `options` parameter')
    }

    const handlerNames = Object.keys(this.configuration)

    const filterOptionKeys = ['only', 'except']
    filterOptionKeys.forEach(key => {
      const optionNames = options[key]

      if (hasOwnProperty(options, key)) {
        if (!isArray(optionNames)) {
          throw new Error(`Key \`${key}\` in \`options\` parameter is not an array`)
        }

        optionNames.forEach(name => {
          if (!handlerNames.includes(name)) {
            throw new Error(`Key \`${key}\` in \`options\` parameter contains unknown handler: ${name}`)
          }
        })
      }
    })

    const handlersWithBeforeAction =
      options.only ||
      (!options.except && handlerNames) ||
      (handlerNames.filter(name => !options.except.includes(name)))

    handlersWithBeforeAction.forEach(name => {
      const before = this.configuration[name].before

      if (!before.includes(beforeAction)) {
        before.push(beforeAction)
      }
    })
  }

  /**
   * @return {Object} The built handler functions including before actions.
   */
  handlers () {
    const handlerNames = Object.keys(this.configuration)
    const handlers = {}

    handlerNames.forEach(name => {
      const config = this.configuration[name]
      handlers[name] = buildHandler(config.handler, { before: config.before })
    })

    return handlers
  }
}

function hasOwnProperty (object, property) {
  return Object.prototype.hasOwnProperty.call(object, property)
}

module.exports = RequestHandlerBuilder
