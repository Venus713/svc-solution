const { error } = require('lib-core')
const { isEmpty } = require('lodash')

module.exports = async (args, { token, user, db }, ast) => {
  if (
    user.isAnonymous
  ) {
    return error.AccessDeniedError()
  }

  const profile = await db.Profile.findOne({
    _id: args.id
  })

  if (isEmpty(profile)) {
    return error.NotFoundError()
  }

  // profile.archive = true

  return profile.save()
}
