'use strict'

process.env.NODE_ENV = 'test'

const nock = require('nock')
const nullLogger = require('null-logger')

const Config = require('../src/config')
Config.logger = nullLogger

process.env.HMAC_ACCESS_KEY = 'access-key'
process.env.HMAC_SECRET_KEY = 'secret-key'
process.env.DOORKEEPER_BASE_URL = 'http://doorkeeper.example.org'

const USER_ID = '007-junior'
const SERVICE_TOKEN = 'f3jy403fyhowidh3920edhhd9h93dj230dk02fd023'

const eventHeaders = {
  Accept: 'application/vnd.api+json',
  Authorization: `Bearer ${SERVICE_TOKEN}`
}

const responseValidateServiceToken = {
  data: {
    id: USER_ID,
    type: 'users',
    attributes: {
      contact_id: `${USER_ID}-contact`,
      login: '007.junior@infopark.de',
      gender: 'M',
      first_name: '007',
      last_name: 'Junior',
      email: '007.junior@infopark.de',
      applications: [
        'meinebima'
      ],
      avatar_url: `https://contactservice-development.bundesimmo.de/api/contacts/${USER_ID}-contact/avatar`,
      registered_at: null,
      last_login_at: '2018-06-22T10:30:47.000+02:00',
      login_changed_at: null,
      password_changed_at: '2017-05-30T11:06:08.000+02:00'
    },
    relationships: {
      permission: {
        data: {
          type: 'permissions',
          id: USER_ID
        },
        meta: {
          included: true
        }
      },
      business_apps: {
        meta: {
          included: false
        }
      }
    }
  },
  included: [
    {
      id: USER_ID,
      type: 'permissions',
      attributes: {
        rules: {
          realestate: {
            parent: null,
            privileges: { visitor: true, editor: true },
            resource: 'realestate'
          },
          blog: {
            parent: null,
            privileges: { writer: true, supervisor: false, admin: true },
            resource: 'blog'
          },
          'blog::entry': {
            parent: 'blog',
            privileges: { writer: true, supervisor: true },
            resource: 'blog::entry'
          },
          'blog::entry::like': {
            parent: 'blog',
            privileges: { writer: false },
            resource: 'blog::entry::like'
          },
          'blog::user': {
            parent: 'blog',
            privileges: { admin: true },
            resource: 'blog::user'
          }
        }
      }
    }
  ],
  jsonapi: {
    version: '1.0'
  }
}

function setupAuthentication () {
  nock(process.env.DOORKEEPER_BASE_URL)
    .post('/api/users/authenticate')
    .reply((uri, body) => {
      try {
        const json = JSON.parse(body)
        if (json.service_token === SERVICE_TOKEN) {
          return [
            200,
            responseValidateServiceToken
          ]
        }
      } catch (e) {}
      return [
        401,
        'Not Authorized'
      ]
    })
}

module.exports = {
  SERVICE_TOKEN,
  eventHeaders,
  setupAuthentication,
  responseValidateServiceToken
}
