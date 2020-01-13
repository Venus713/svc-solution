const { has, map, reduce } = require('lodash')
const { error } = require('lib-core')

module.exports = async (args, { token, user, db }, ast) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

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

  if (has(args, 'type')) {
    query.type = { $in: args.type }
  }

  if (has(args, 'description')) {
    query.description = args.description
  }

  if (has(args, 'version')) {
    query.version = args.version
  }

  if (has(args, 'parent')) {
    query.parent = args.parent
  }

  let [ count, data ] = await Promise.all([
    db.Module.countDocuments(query),
    db.Module.find(query).sort(sort).limit(limit).skip(offset)
  ])

  return { count, data }
}
