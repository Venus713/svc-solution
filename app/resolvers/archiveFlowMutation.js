const { error } = require('lib-core')
const { isEmpty } = require('lodash')

module.exports = async (args, { token, user, db }, ast) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  const flow = await db.Flow.findOne({
    _id: args.id
  })

  if (isEmpty(flow)) {
    return error.NotFoundError()
  }

  // flow.archive = true

  return flow.save()
}
