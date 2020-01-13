const path = require('path')

module.exports = async () => {
  return require(path.resolve('package.json')).version
}
