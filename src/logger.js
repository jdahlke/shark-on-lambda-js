'use strict'

const Config = require('./config')

/**
 * @class Logger
 * @classdesc This class logs messages and objects.
 *
 */
class Logger {
  /**
   * Log message on console.error.
   *
   * @param {object} message
   */
  error (message) {
    if (message) {
      console.error(JSON.stringify(message, null, 2))
    }
  }

  /**
   * Log message on console.debug.
   *
   * @param {object} message
   */
  info (message) {
    if (message) {
      console.info(JSON.stringify(message, null, 2))
    }
  }

  /**
   * Log message on console.info.
   *
   * @param {object} message
   */
  debug (message) {
    if (Config.debug && message) {
      console.debug(JSON.stringify(message, null, 2))
    }
  }
}

module.exports = Logger
