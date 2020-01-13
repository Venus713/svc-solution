const { error } = require('lib-core')
const { isEmpty } = require('lodash')
const path = require('path')
const userHelper = require(path.resolve('app', 'helpers', 'user'))

module.exports = async (args, { token, user, db, logger }, ast) => {
  if (
    user.isAnonymous
  ) {
    return error.AccessDeniedError()
  }

  const existingProfile = await db.Profile.findOne({ name: args.name })

  if (!isEmpty(existingProfile)) {
    return error('Profile with this name already exists.')
  }

  let resolvedUser = user
  try {
    resolvedUser = await userHelper.getMe(token)
  } catch (e) {
    logger.error(e)
  }

  const flow = await db.Flow.findOne({ _id: args.flowId })

  if (isEmpty(flow)) {
    return error('No flow exists with this id', 404)
  }

  const profile = new db.Profile({
    ...args,
    author: {
      id: resolvedUser.id,
      name: `${resolvedUser.firstName} ${resolvedUser.lastName}`,
      internalId: resolvedUser.internalId
    },
    version: '1.0.0',
  })

  try {
    await db.Counter
    .findOneAndUpdate(
      {
        _id: `profile-${profile.id}`
      },
      {
        $inc: { sequenceValue: 1 }
      },
      {
        new: true,
        upsert: true
      }
    )
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  try {
    await profile.save()
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  return profile
}
