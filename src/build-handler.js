'use strict'

const Controller = require('./controller')
const Logger = require('./logger')

const logger = new Logger()

/**
 * @example
 * const { authenticate, buildHandler, ApiResponse } = require('bima-shark-on-lambda')
 *
 * async function create (event, context, callback) {
 *   return ApiResponse(201, body)
 * }
 *
 * module.exports.create = buildHandler(create, { before: [authenticate] })
 */
function buildHandler (handler, options = {}) {
  const controller = new Controller({
    handler: handler,
    beforeActions: options.before
  })

  const beforeActionsNames = (options.before || []).map(f => f.name)
  logger.info(`Building handler '${handler.name}' with before: ${JSON.stringify(beforeActionsNames)}`)

  return (event, context, callback) => {
    return controller.execute(event, context, callback)
  }
}

module.exports = buildHandler
