'use strict'

const { ServiceTokenClient } = require('bima-shark-sdk')

const ApiError = require('./api-error')
const Logger = require('./logger')

const logger = new Logger()

/**
 * Before action that handles authentication
 *
 * @param {object} event
 * @param {object} context
 * @param {object} callback
 */
async function authenticate (event, context, callback) {
  logger.debug('Authentication: start ...')

  let serviceToken

  if (event.shark && event.shark.serviceToken) {
    serviceToken = event.shark.serviceToken
  } else {
    const message = 'Authentication failed: serviceToken not found in event.shark'
    logger.info(message)
    throw new ApiError(401, message)
  }

  const client = new ServiceTokenClient({
    accessKey: process.env.HMAC_ACCESS_KEY,
    secretKey: process.env.HMAC_SECRET_KEY,
    baseUrl: process.env.DOORKEEPER_BASE_URL
  })

  try {
    const user = await client.verifyServiceToken({
      serviceToken: serviceToken,
      include: 'permission'
    })
    event.shark.user = user
  } catch (e) {
    const message = 'Authentication failed: verifyServiceToken() error'
    logger.info(message)
    logger.info(e)
    throw new ApiError(401, message)
  }

  logger.debug('Authentication: ... finished')
}

module.exports = authenticate
