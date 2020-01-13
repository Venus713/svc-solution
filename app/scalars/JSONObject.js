const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')
const { isPlainObject } = require('lodash')

const parseLiteral = (ast, variables) => {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)
    case Kind.OBJECT:
      return parseObject(ast, variables)
    case Kind.LIST:
      return ast.values.map(n => parseLiteral(n, variables))
    case Kind.NULL:
      return null
    case Kind.VARIABLE: {
      const name = ast.name.value
      return variables ? variables[name] : undefined
    }
    default:
      return undefined
  }
}

const parseObject = (ast, variables) => {
  const value = Object.create(null)
  ast.fields.forEach(field => {
    value[field.name.value] = parseLiteral(field.value, variables)
  })

  return value
}

const ensureObject = (value) => {
  if (!isPlainObject(value)) {
    throw new TypeError(
      `JSONObject cannot represent non-object value: ${value}`
    )
  }

  return value
}

module.exports = new GraphQLScalarType({
  name: 'JSONObject',
  description:
    'The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize: ensureObject,
  parseValue: ensureObject,
  parseLiteral: parseObject
})
