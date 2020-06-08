/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { Deserializer } = require('jsonapi-serializer')

const authenticate = require('../src/authenticate')

const {
  SERVICE_TOKEN,
  responseValidateServiceToken,
  setupAuthentication
} = require('./test-helper')

const deserializer = new Deserializer({ keyForAttribute: 'camelCase' })

describe('authenticate()', () => {
  beforeEach(() => {
    setupAuthentication()
  })

  context('without event.shark.serviceToken', () => {
    const event = { shark: {} }

    it('throws an Error', async () => {
      try {
        await authenticate(event)
      } catch (e) {
        expect(e.statusCode).to.eq(401)
        expect(e.message).to.eq('Authentication failed: serviceToken not found in event.shark')
      }
    })
  })

  context('with invalid event.shark.serviceToken', () => {
    const event = { shark: { serviceToken: 'invalid-jwt' } }

    it('throws an Error', async () => {
      try {
        await authenticate(event)
      } catch (e) {
        expect(e.statusCode).to.eq(401)
      }
    })
  })

  context('with valid event.shark.serviceToken', () => {
    it('throws an Error', async () => {
      const user = await deserializer.deserialize(responseValidateServiceToken)
      const event = { shark: { serviceToken: SERVICE_TOKEN } }

      await authenticate(event)

      expect(event.shark.user).to.be.an('object')
      expect(event.shark.user.id).to.eq(user.id)
      expect(event.shark.user.email).to.eq(user.email)
    })
  })
})
