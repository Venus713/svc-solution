const { isEmpty, omit, get, has, isEqual } = require('lodash')
const { error } = require('lib-core')
const path = require('path')
const versioningHelper = require(path.resolve('app', 'helpers', 'versioning'))

const getUpdateMode = (flow, args) => {
  if (!has(args, 'data') || isEqual(args.data, flow.data)) {
    return 'PATCH'
  }

  const argModuleIds = args.data.map(module => module.id)
  const flowModuleIds = flow.data.map(module => module.id)

  if (isEqual(argModuleIds, flowModuleIds)) {
    return 'MINOR'
  }
  return 'MAJOR'
}

module.exports = async (args, { user, db, logger }) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  const query = { _id: args.id }
  const flow = await db.Flow.findOne(query)

  if (isEmpty(flow)) {
    return error.NotFoundError()
  }

  if (get(flow, 'author.id', '') !== user.id && !user.isOwner) {
    return error('You are not allowed to update the flow', 403)
  }

  const historyRecord = omit(
    Object.assign({}, flow.toJSON(), {
      flowId: flow._id,
      updatedBy: {
        id: user.id,
        name: [user.firstName, user.lastName].join(' ')
      },
    }),
    ['_id', 'createdAt', 'updatedAt']
  )
  const history = new db.FlowHistory(historyRecord)

  await history.save()

  const currentVersion = flow.version.toString()
  const updateMode = getUpdateMode(flow, args)

  flow.version = versioningHelper.bumpVersion(currentVersion, updateMode)

  let fetchedModules = []

  if (has(args, 'data')) {
    const moduleNames = args.data.map(moduleInfo => moduleInfo.type)

    try {
      fetchedModules = await db.Module.find({ name: { $in: moduleNames }})
    } catch (e) {
      logger.error(e)
      return error(e)
    }

    fetchedModules = fetchedModules.map(module => {
      return {
        id: module._id,
        name: module.name,
        version: module.version,
      }
    })
  }

  flow.set(args)

  flow.order += 1

  const newFlowData = {
    ...flow._doc,
    modules: fetchedModules,
    parent: flow.parent ? flow.parent : flow.id
  }

  delete newFlowData._id
  delete newFlowData.__v

  const newFlow = new db.Flow(newFlowData)

  await newFlow.save()

  logger.info(
    `
    Flow = ${flow.id}, name = ${flow.name}
    is updated by user ${user.id}
    `
  )

  return newFlow
}
