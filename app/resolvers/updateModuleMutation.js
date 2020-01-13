const { isEmpty, omit, get, has } = require('lodash')
const { error } = require('lib-core')
const path = require('path')
const versioningHelper = require(path.resolve('app', 'helpers', 'versioning'))

module.exports = async (args, { user, db, logger }) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  const query = { _id: args.id }
  const module = await db.Module.findOne(query)

  if (isEmpty(module)) {
    return error.NotFoundError()
  }

  if (get(module, 'author.id', '') !== user.id && !user.isOwner) {
    return error('You are not allowed to update the module', 403)
  }

  const historyRecord = omit(
    Object.assign({}, module.toJSON(), {
      moduleId: module._id,
      updatedBy: {
        id: user.id,
        name: [user.firstName, user.lastName].join(' ')
      },
    }),
    ['_id', 'createdAt', 'updatedAt']
  )
  const history = new db.ModuleHistory(historyRecord)

  await history.save()

  module.set(args)

  const currentVersion = module.version.toString()
  const updateMode = args.updateMode ? args.updateMode : 'PATCH'

  module.version = versioningHelper.bumpVersion(currentVersion, updateMode)

  module.order += 1

  const newModuleData = {
    ...module._doc,
    parent: module.parent ? module.parent : module.id
  }

  delete newModuleData._id
  delete newModuleData.__v

  const newModule = new db.Module(newModuleData)

  await newModule.save()

  logger.info(
    `
    Module = ${module.id}, name = ${module.name}
    is updated by user ${user.id}
    `
  )

  return newModule
}
