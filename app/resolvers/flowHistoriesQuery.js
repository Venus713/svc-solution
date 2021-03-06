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

  if (has(args, 'id')) {
    query._id = { $in: args.id }
  }

  if (has(args, 'flowId')) {
    query.flowId = args.flowId
  }

  if (has(args, 'parent')) {
    query.parent = args.parent
  }

  let [ count, data ] = await Promise.all([
    db.FlowHistory.countDocuments(query),
    db.FlowHistory.find(query).sort(sort).limit(limit).skip(offset)
  ])

  return { count, data }
}
