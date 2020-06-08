'use strict'

const Config = require('./config')

/**
 * @class Logger
 * @classdesc This class logs messages and objects.
 *
 */
class Logger {
  /**
   * Log message on console.info.
   *
   * @param {object} message
   */
  info (message) {
    const logger = Config.logger || console

    if (message) {
      logger.info(JSON.stringify(message, null, 2))
    }
  }
}

module.exports = Logger
