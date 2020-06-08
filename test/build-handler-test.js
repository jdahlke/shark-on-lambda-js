/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const LambdaTester = require('lambda-tester')

const { eventHeaders, setupAuthentication } = require('./test-helper')
const {
  ApiResponse,
  authenticate,
  buildHandler
} = require('../index')

function success (event, context, callback) {
  return new ApiResponse(200, 'Success')
}

function redirect (event, context, callback) {
  return {
    statusCode: 302,
    headers: {
      Location: 'https://www.example.org'
    }
  }
}

describe('buildHandler()', () => {
  context('without before actions', () => {
    context('and success response', () => {
      const successHandler = buildHandler(success)

      it('returns 200 success', () => {
        return LambdaTester(successHandler)
          .event({
            headers: eventHeaders
          })
          .expectResolve(result => {
            expect(result.statusCode).to.eql(200)
          })
      })
    })

    context('and redirect response', () => {
      const redirectHandler = buildHandler(redirect)

      it('returns 30x redirect', () => {
        return LambdaTester(redirectHandler)
          .event({
            headers: eventHeaders
          })
          .expectResolve(result => {
            expect(result.statusCode).to.eql(302)
          })
      })
    })
  })

  describe('with before actions [authenticate]', () => {
    const successHandler = buildHandler(success, { before: [authenticate] })

    beforeEach(() => {
      setupAuthentication()
    })

    context('with correct Authorization header', () => {
      it('returns 200 success', () => {
        return LambdaTester(successHandler)
          .event({
            headers: eventHeaders
          })
          .expectResolve(result => {
            expect(result.statusCode).to.eql(200)
          })
      })
    })

    context('without Authorization header', () => {
      it('returns 401 unauthorized', () => {
        return LambdaTester(successHandler)
          .event({
            headers: {}
          })
          .expectResolve(result => {
            expect(result.statusCode).to.eql(401)
          })
      })
    })
  })

  describe('with anonymous before action', () => {
    const successHandler = buildHandler(success, { before: [() => {}] })

    it('returns 200 success', () => {
      return LambdaTester(successHandler)
        .event({
          headers: eventHeaders
        })
        .expectResolve(result => {
          expect(result.statusCode).to.eql(200)
        })
    })
  })
})
