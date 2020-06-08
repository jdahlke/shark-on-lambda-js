/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { Deserializer } = require('jsonapi-serializer')

const ApiError = require('../src/api-error')
const authorize = require('../src/authorize')

const { responseValidateServiceToken } = require('./test-helper')

const deserializer = new Deserializer({ keyForAttribute: 'camelCase' })

describe('authorize()', () => {
  let authenticatedUser

  before(async () => {
    authenticatedUser = await deserializer.deserialize(responseValidateServiceToken)
  })

  context('when custom authorization callback function is not defined', () => {
    it('throws an error', () => {
      expect(() => {
        authorize(authenticatedUser)
      }).to.throw(Error, 'Parameter `authorizationCallback` is missing or not a function!')
    })
  })

  context('when custom authorization callback function is defined', () => {
    context('when custom authorization callback function returns exactly true', () => {
      it('does not throw `ApiError`', () => {
        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog', ['supervisor']) || userPolicy.isAuthorized('realestate', ['visitor'])
          })
        }).not.to.throw(ApiError)
      })
    })

    context('when custom authorization callback function returns false', () => {
      it('throws `ApiError`', () => {
        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog', ['supervisor'])
          })
        }).to.throw(ApiError, 'Not authorized')

        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog', ['god'])
          })
        }).to.throw(ApiError, 'Not authorized')
      })
    })

    context('when resource is not included in permission rules', () => {
      it('looks in parent rules', () => {
        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog::entry::comment', ['writer'])
          })
        }).not.to.throw(ApiError)

        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog::entry::comment', ['god'])
          })
        }).to.throw(ApiError)

        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog::entry::comment', ['god', 'writer'])
          })
        }).not.to.throw(ApiError)
      })
    })

    context('when privilege permitted to parent resource', () => {
      it('allow access', () => {
        expect(() => {
          authorize(authenticatedUser, userPolicy => {
            return userPolicy.isAuthorized('blog::entry::like', ['writer'])
          })
        }).not.to.throw(ApiError)
      })
    })

    context('when custom authorization callback function does not return Boolean value', () => {
      it('throws `ApiError`', () => {
        expect(() => {
          authorize(authenticatedUser, () => {
            return 'some-string-value'
          })
        }).to.throw(ApiError, 'Not authorized')
      })
    })
  })
})
