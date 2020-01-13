const path = require('path')
const { authGqlClient } = require(path.resolve('app', 'helpers', 'serviceClients'))
const { flatten } = require('lodash')
const extractScopeResources = async (token, resourceType) => {
  const query = `
    query {
      me {
        scopesLink {
          id
          resources {
            id
            type
          }
        }
      }
    }
  `
  const response = await authGqlClient(token).request(query)
  const data = flatten(response.me.scopesLink.map(
    scope => scope.resources.filter(resource => resource.type === resourceType)
  ))

  return data
}
const getMe = async (token) => {
  const query = `
    query {
      me {
        internalId
        id
        firstName
        lastName
      }
    }
  `
  const response = await authGqlClient(token).request(query)
  return response.me
}

module.exports = { extractScopeResources, getMe }
