const { error } = require('lib-core')
const generate = require('nanoid/generate')

module.exports = async (args, { logger, token, user, db }) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  if (!user.isOwner) {
    return error('You are not allowed to create the license', 403)
  }

  const serialNumber = generate('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 16)
  const license = new db.License({
    ...args,
    serial: `${serialNumber.slice(0,4)}-${serialNumber.slice(4,8)}-${serialNumber.slice(8, 12)}-${serialNumber.slice(12, 16)}`
  })

  try {
    await license.save()
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  return license
}
