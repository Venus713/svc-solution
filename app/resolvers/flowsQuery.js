const { has, map, reduce, first, isEmpty } = require('lodash')
const { error } = require('lib-core')
const requestedFields = require('graphql-fields')

module.exports = async (args, { token, user, db }, ast) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  const fields = requestedFields(ast)

  const { limit, offset } = args
  const query = {}
  const sort = reduce(
    map(args.sort, (row) => ({ [ row.field ]: row.type.toLowerCase() })),
    (acc, value) => ({ ...acc, ...value })
  )

  if (has(args, 'filters')) {
    query[`$and`] = []
    args.filters.forEach(filter => {
      let { field, value, operator } = filter
      
      if (!operator) operator = 'equals'
      if (!operator || ['equals', 'contains'].includes(operator)) {
        query[`$and`].push({ [`${field}`]: { [`$eq`]: value }});
      } else {
        query[`$and`].push({ [`${field}`]: { [`$${operator}`]: value }});
      }
    })
  }

  if (has(args, 'id')) {
    query._id = { $in: args.id }
  }

  if (has(args, 'name')) {
    query.name = { '$regex': args.name, '$options': 'i' }
  }

  if (has(args, 'internalId') && args.internalId) {
    query.internalId = args.internalId
  }

  if (has(args, 'active') && args.active) {
    query.active = args.active
  }

  if (has(args, 'category') && args.category) {
    query.category = args.category
  }

  if (has(args, 'description') && args.description) {
    query.description = args.description
  }

  if (has(args, 'version') && args.version) {
    query.version = args.version
  }

  if (has(args, 'parent')) {
    query.parent = args.parent
  }

  const [ count, data ] = await Promise.all([
    db.Flow.countDocuments(query),
    db.Flow.find(query).sort(sort).limit(limit).skip(offset)
  ])

  if (
    has(fields, 'data.modules') &&
    has(args, 'id') &&
    isEmpty(data) === false
  ) {
    const modules = await db.Module.find({
      name: first(data).data.map((node) => node.type)
    })

    data[0].modules = modules
  }

  return { count, data }
}
