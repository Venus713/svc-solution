const { GraphQLScalarType } = require('graphql')
const parseValue = (value) => {
  return value
}

const serialize = (value) => {
  return value
}

const parseLiteral = (ast) => {
  if (ast.kind === 'IntValue') {
    return parseInt(ast.value)
  }

  if (ast.kind === 'FloatValue') {
    return parseFloat(ast.value)
  }

  return ast
}

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'Shows date in timezone supported format',
  serialize,
  parseValue,
  parseLiteral
})
