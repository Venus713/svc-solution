const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const { DB_URI, DB_DEBUG } = process.env
const models = {}

// TODO: change to singleton
mongoose.set('debug', DB_DEBUG || false)

mongoose.connect(DB_URI, { useNewUrlParser: true })

const connection = mongoose.connection

connection.on(
  'open',
  () => console.log('[mongodb] connection has been established.')
)
connection.on('error', console.error)

fs.readdirSync(path.resolve('app', 'models'))
  .filter((file) => (file !== 'index.js'))
  .forEach((file) => {
    const modelName = file.substring(0, file.indexOf('.'))

    models[modelName] = require(path.resolve('app', 'models', file))
    // models[modelName].ensureIndexes()
  })

module.exports = models
module.exports.connection = connection
