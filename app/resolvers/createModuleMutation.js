const { error } = require('lib-core')
const path = require('path')
const userHelper = require(path.resolve('app', 'helpers', 'user'))
const { get } = require('lodash')

module.exports = async (args, { logger, token, user, db }) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  let resolvedUser = user
  try {
    resolvedUser = await userHelper.getMe(token)
  } catch (e) {
    logger.error(e)
  }

  const module = new db.Module({
    ...args,
    author: {
      id: resolvedUser.id,
      name: `${resolvedUser.firstName} ${resolvedUser.lastName}`,
      internalId: resolvedUser.internalId
    },
    version: '1.0.0',
  })

  const sequence = await db.Counter
    .findOneAndUpdate(
      {
        _id: `module-${module.id}`
      },
      {
        $inc: { sequenceValue: 1 }
      },
      {
        new: true,
        upsert: true
      }
    )
  const order = get(sequence, 'sequenceValue', 0)

  module.set('order', order)

  try {
    await module.save()
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  // nodeRedHelper
  //   .installNodes({module})
  //   .catch(e => {
  //     console.error(e)
  //   })

  return module
}
