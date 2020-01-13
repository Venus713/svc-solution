const { getApp } = require('lib-core').server
const { HOST, PORT } = process.env
const path = require('path')
const keyPath = path.resolve('config', 'keys', 'svc-auth-public.pem')
const { server, app } = getApp({ keyPath })

app.listen({
  port: PORT
}, () =>
  console.log(`🚀 Server ready at http://${HOST}:${PORT}${server.graphqlPath}`)
)
