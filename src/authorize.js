'use strict'

const { isFunction, isString, isArray, isObject } = require('bima-shark-sdk')
const ApiError = require('./api-error')

/**
 * @callback authorizationCallback
 *
 * @param {Policy} [policy]
 *
 * @return {*} Must be strictly equal true to pass authorize() with this custom authorization callback function
 */

/**
 * Authorizes an authenticated user with a custom authorization callback function.
 *
 * @param {Object} user Deserialized user
 * @param {authorizationCallback} authorizationCallback Custom authorization callback function
 *
 * @throws {Error} Parameter user must be an Object
 * @throws {Error} Parameter authorizationCallback must be a function
 * @throws {ApiError} Throws an ApiError if the custom authorization callback function does not return true
 *
 * @example
 * const permission = {
 *   rules: {
 *     blog: {
 *       resource: 'blog',
 *       privileges: {
 *         admin: false,
 *         supervisor: false,
 *         writer: true
 *       }
 *     }
 *   }
 * }
 *
 * const user = {
 *   id: 'john-doe',
 *   permission: permission
 * }
 *
 * const article = {
 *   id: '123',
 *   authorId: 'john-doe'
 * }
 *
 * // passes
 * authorize(user, userPolicy => {
 *   if (user.id === article.authorId) return true
 *   return userPolicy.isAuthorized('blog', ['admin', 'supervisor'])
 * })
 *
 * // fails and throws new ApiError(403, 'Not authorized')
 * authorize(user, userPolicy => {
 *   return userPolicy.isAuthorized('blog', ['admin', 'supervisor'])
 * })
 *
 * // passes
 * authorize(user, userPolicy => {
 *   return userPolicy.isAuthorized('blog', ['admin', 'supervisor', 'writer'])
 * })
 *
 * // passes
 * authorize(user, () => {
 *   return user.id === article.authorId
 * })
 */
const authorize = (user, authorizationCallback) => {
  if (!isObject(user)) {
    throw new Error('Parameter `user` is missing or not an Object!')
  }

  if (!isFunction(authorizationCallback)) {
    throw new Error('Parameter `authorizationCallback` is missing or not a function!')
  }

  const rules = (user.permission || {}).rules || {}
  const policy = new Policy(rules)

  if (authorizationCallback(policy) !== true) {
    throw new ApiError(403, 'Not authorized')
  }
}

/**
 * Class representing an user policy based on permission rules.
 */
class Policy {
  /**
   * Creates a new Policy.
   *
   * @param {Object} rules User permission rules
   */
  constructor (rules) {
    this.rules = rules
  }

  /**
   * Checks if the user permission rules include an allowed resource with one of the given privileges.
   *
   * @param {string} resource Name of the resource
   * @param {string[]} privileges List of privileges
   *
   * @throws {Error} Parameter resource must be a string
   * @throws {Error} Parameter privileges must be an array
   *
   * @return {boolean} True if some of the privileges is authorized for the given resource, otherwise false
   *
   * @example
   * const rules: {
   *   blog: {
   *     resource: 'blog',
   *     parent: null,
   *     privileges: {
   *       writer: true
   *     }
   *   },
   *   'blog::entry': {
   *     resource: 'blog::entry',
   *     parent: 'blog',
   *     privileges: {
   *       supervisor: true
   *     }
   *   },
   * }
   *
   * const userPolicy = new Policy(rules)
   *
   * // returns true
   * userPolicy.isAuthorized('blog', ['admin', 'supervisor', 'writer'])
   *
   * // returns false
   * userPolicy.isAuthorized('blog', ['admin', 'supervisor'])
   *
   * // returns true
   * userPolicy.isAuthorized('blog::entry', ['admin', 'supervisor'])
   *
   * // returns true
   * userPolicy.isAuthorized('blog::entry', ['writer'])
   *
   * // returns true
   * userPolicy.isAuthorized('blog::entry::comment', ['writer'])
   */
  isAuthorized (resource, privileges) {
    if (!resource || !isString(resource)) {
      throw new Error('Parameter `resource` is missing or not a string!')
    }

    if (!isArray(privileges)) {
      throw new Error('Parameter `privileges` is missing or not an array!')
    }

    return privileges.some(privilege => {
      const resourceParts = resource.split('::')

      for (let i = resourceParts.length; i > 0; i--) {
        const resourcePart = resourceParts.slice(0, i).join('::')
        const isPrivilegeAuthorized = this.isPrivilegeAuthorized(resourcePart, privilege)

        if (isPrivilegeAuthorized) return true
      }

      return false
    })
  }

  /**
   * @private
   */
  isPrivilegeAuthorized (resource, privilege) {
    const resourceRule = this.rules[resource]
    if (!resourceRule) return

    return (resourceRule.privileges || {})[privilege]
  }
}

module.exports = authorize
