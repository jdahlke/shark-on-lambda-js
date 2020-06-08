/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const LambdaTester = require('lambda-tester')

const { eventHeaders } = require('./test-helper')
const {
  ApiResponse,
  RequestHandlerBuilder,
  authenticate
} = require('../index')

const handlers = {
  create: (event, context, callback) => new ApiResponse(201, 'Success'),
  read: (event, context, callback) => new ApiResponse(200, 'Success'),
  update: (event, context, callback) => new ApiResponse(200, 'Success')
}

describe('RequestHandlerBuilder', () => {
  describe('constructor', () => {
    context('with empty arguments', () => {
      it('has empty configuration ', () => {
        const builder = new RequestHandlerBuilder()
        expect(builder.handlers()).to.eql({})
      })
    })

    context('with functions', () => {
      it('creates given handlers', () => {
        const builder = new RequestHandlerBuilder({ readHandler: handlers.read })
        expect(builder.handlers().readHandler).to.be.a('function')
      })
    })
  })

  describe('instance', () => {
    let builder

    beforeEach(() => {
      builder = new RequestHandlerBuilder()
    })

    describe('addHandlers()', () => {
      context('with empty arguments', () => {
        it('has empty configuration ', () => {
          builder.addHandlers({})
          expect(builder.handlers()).to.eql({})
        })
      })

      context('with functions', () => {
        it('creates given handlers', () => {
          builder.addHandlers({ read: handlers.read })
          expect(builder.handlers().read).to.be.a('function')
        })
      })
    })

    describe('addBeforeAction()', () => {
      beforeEach(() => {
        builder.addHandlers(handlers)
      })

      context('with empty arguments', () => {
        it('throws Error', () => {
          expect(() => builder.addBeforeAction())
            .to.throw(/Parameter `beforeAction` is missing or not a function/)
        })
      })

      context('with empty options', () => {
        context('when another action has not been added before', () => {
          it('adds beforeAction for every handler', () => {
            builder.addBeforeAction(authenticate)

            Object.keys(builder.configuration).forEach(name => {
              expect(builder.configuration[name].before).to.have.members([authenticate])
            })
          })
        })

        context('when another action has been added before', () => {
          const doSomething = () => 'I did something'

          beforeEach(() => {
            builder.addBeforeAction(doSomething)
          })

          it('keeps already added before actions and adds beforeAction for every handler', () => {
            builder.addBeforeAction(authenticate)

            Object.keys(builder.configuration).forEach(name => {
              expect(builder.configuration[name].before).to.have.members([doSomething, authenticate])
            })
          })
        })
      })

      context('with options', () => {
        context('when `options` is not an Object', () => {
          it('throws an error', () => {
            expect(() => builder.addBeforeAction(authenticate, ['create']))
              .to.throw('Parameter `options` is not an Object')
          })
        })

        context('when both options are set, `only` and `except`', () => {
          it('throws an error', () => {
            expect(() => builder.addBeforeAction(authenticate, { only: ['create'], except: ['read'] }))
              .to.throw(/`only` and `except` keys cannot be used together in `options` parameter/)
          })
        })

        context('with `only` option set', () => {
          context('with unknown handler', () => {
            it('throws Error', () => {
              expect(() => builder.addBeforeAction(authenticate, { only: ['create', 'read', 'not-a-handler'] }))
                .to.throw(/unknown handler/)
            })
          })

          context('with no array', () => {
            it('throws an error', () => {
              expect(() => builder.addBeforeAction(authenticate, { only: 'read' }))
                .to.throw(/is not an array/)
            })
          })

          context('with an array', () => {
            it('adds beforeAction to given handlers', () => {
              builder.addBeforeAction(authenticate, { only: ['read'] })
              const { configuration } = builder

              expect(configuration.create.before).to.have.members([])
              expect(configuration.read.before).to.have.members([authenticate])
              expect(configuration.update.before).to.have.members([])
            })
          })
        })

        context('with `except` option set', () => {
          context('with unknown handler', () => {
            it('throws Error', () => {
              expect(() => builder.addBeforeAction(authenticate, { except: ['create', 'read', 'not-a-handler'] }))
                .to.throw(/unknown handler/)
            })
          })

          context('with no array', () => {
            it('throws an error', () => {
              expect(() => builder.addBeforeAction(authenticate, { except: 'read' }))
                .to.throw(/is not an array/)
            })
          })

          context('with an array', () => {
            it('adds beforeAction for all handlers except the given ones', () => {
              builder.addBeforeAction(authenticate, { except: ['read'] })
              const { configuration } = builder

              expect(configuration.create.before).to.have.members([authenticate])
              expect(configuration.read.before).to.have.members([])
              expect(configuration.update.before).to.have.members([authenticate])
            })
          })
        })

        context('when same beforeAction has been already added for handlers', () => {
          beforeEach(() => {
            builder.addBeforeAction(authenticate)
          })

          context('with `only` option', () => {
            beforeEach(() => {
              builder.addBeforeAction(authenticate, { only: ['create', 'read'] })
            })

            it('does not add beforeActions twice', () => {
              const { configuration } = builder

              expect(configuration.create.before).to.have.members([authenticate])
              expect(configuration.read.before).to.have.members([authenticate])
              expect(configuration.update.before).to.have.members([authenticate])
            })
          })

          context('with `except` option', () => {
            beforeEach(() => {
              builder.addBeforeAction(authenticate, { except: ['create', 'read'] })
            })

            it('does not remove beforeActions from handlers', () => {
              const { configuration } = builder

              expect(configuration.create.before).to.have.members([authenticate])
              expect(configuration.read.before).to.have.members([authenticate])
              expect(configuration.update.before).to.have.members([authenticate])
            })
          })
        })

        context('when same beforeAction has been already added for some handlers', () => {
          beforeEach(() => {
            builder.addBeforeAction(authenticate, { only: ['create'] })
          })

          context('with `only` option', () => {
            beforeEach(() => {
              builder.addBeforeAction(authenticate, { only: ['create', 'read'] })
            })

            it('adds beforeAction to given handlers if not already added', () => {
              const { configuration } = builder

              expect(configuration.create.before).to.eql([authenticate])
              expect(configuration.read.before).to.eql([authenticate])
              expect(configuration.update.before).to.eql([])
            })
          })

          context('with `except` option', () => {
            beforeEach(() => {
              builder.addBeforeAction(authenticate, { except: ['create', 'read'] })
            })

            it('does not remove beforeAction when already added and adds when not in `except` option', () => {
              const { configuration } = builder

              expect(configuration.create.before).to.have.members([authenticate])
              expect(configuration.read.before).to.have.members([])
              expect(configuration.update.before).to.have.members([authenticate])
            })
          })
        })
      })
    })

    describe('handlers()', () => {
      beforeEach(() => {
        builder.addHandlers({ readHandler: handlers.read })
      })

      context('with handler without before action', () => {
        it('returns 200 success', () => {
          return LambdaTester(builder.handlers().readHandler)
            .event({
              headers: eventHeaders
            })
            .expectResolve(result => {
              expect(result.statusCode).to.eql(200)
            })
        })
      })

      context('with handler with before action authenticate', () => {
        beforeEach(() => {
          builder.addBeforeAction(authenticate)
        })

        context('with correct Authorization header', () => {
          it('returns 200 success', () => {
            return LambdaTester(builder.handlers().readHandler)
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
            return LambdaTester(builder.handlers().readHandler)
              .event({
                headers: {}
              })
              .expectResolve(result => {
                expect(result.statusCode).to.eql(401)
              })
          })
        })
      })
    })
  })
})
