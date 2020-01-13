const { error } = require('lib-core')
const path = require('path')
const joi = require('@hapi/joi')
const userHelper = require(path.resolve('app', 'helpers', 'user'))
const { isEmpty, has } = require('lodash')
const schema = joi.object().keys({
  data: joi.array().min(1).required(),
  name: joi.string(),
  description: joi.string(),
  tags: joi.array().items(joi.string()),
  category: joi.string()
}).unknown(false)

module.exports = async (args, { token, user, db, logger }, ast) => {
  if (
    user.isAnonymous
  ) {
    return error.AccessDeniedError()
  }

  const validation = joi.validate(args, schema)

  if (!isEmpty(validation.error)) {
    return error(validation.error)
  }

  let resolvedUser = user
  try {
    resolvedUser = await userHelper.getMe(token)
  } catch (e) {
    logger.error(e)
  }

  const flowSequence = await db.Counter
    .findOneAndUpdate(
      {
        _id: `flowOrder`
      },
      {
        $inc: { sequenceValue: 1 }
      },
      {
        new: true,
        upsert: true
      }
    )
  const flowCount = flowSequence.sequenceValue
  
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

  const flow = new db.Flow({
    ...args,
    author: {
      id: resolvedUser.id,
      name: `${resolvedUser.firstName} ${resolvedUser.lastName}`,
      internalId: resolvedUser.internalId
    },
    name: args.name ? args.name : `Flow - v${flowCount}`,
    version: '1.0.0',
    modules: fetchedModules,
  })

  try {
    await flow.save()
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  return flow
}
