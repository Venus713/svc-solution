const { GraphQLClient } = require('graphql-request')
const { AUTH_SERVICE, DEVICE_SERVICE, MEDIA_SERVICE } = process.env

const authGqlClient = (token) => {
  return new GraphQLClient(AUTH_SERVICE, {
    headers: {
      authorization: `Bearer ${token}`
    }
  })
}

const deviceGqlClient = (token) => {
  return new GraphQLClient(DEVICE_SERVICE, {
    headers: {
      authorization: `Bearer ${token}`
    }
  })
}

const mediaGqlClient = (token) => {
  return new GraphQLClient(`${MEDIA_SERVICE}/graphql`, {
    headers: {
      authorization: `Bearer ${token}`
    }
  })
}

module.exports = { authGqlClient, deviceGqlClient, mediaGqlClient }
