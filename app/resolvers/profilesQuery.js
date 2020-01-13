const { has, map, reduce } = require('lodash')
const { error } = require('lib-core')
const graphqlFields = require('graphql-fields')

module.exports = async (args, { token, user, db, logger }, ast) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  const requestFields = graphqlFields(ast)
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

  if (has(args, 'flowId') && args.flowId) {
    query.flowId = args.flowId
  }

  if (has(args, 'description') && args.description) {
    query.description = args.description
  }

  if (has(args, 'version') && args.version) {
    query.version = args.version
  }

  if (has(args, 'parent') && args.parent) {
    query.parent = args.parent
  }

  let [ count, data ] = await Promise.all([
    db.Profile.countDocuments(query),
    db.Profile.find(query).sort(sort).limit(limit).skip(offset)
  ])

  if (has(requestFields, 'data.flow')) {
    const flowIds = []

    data.forEach(profile => {
      if (profile.flowId) {
        flowIds.push(profile.flowId)
      }
    })

    let flows = []

    try {
      flows = await db.Flow.find({ _id: { $in: flowIds } })
    } catch (e) {
      logger.error(e)
      return error(e)
    }

    data.forEach(profile => {
      const { flowId } = profile
      if (flowId) {
        profile.flow = flows.find(flow => flow._id === flowId)
      }
    })
  }

  return { count, data }
}
