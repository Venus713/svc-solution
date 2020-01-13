const { error } = require('lib-core')
const nodeRed = require('../helpers/nodeRed')

module.exports = async (_, { user, db }) => {
  if (!user.isOwner) {
    return error.AccessDeniedError()
  }

  const nodes = await nodeRed.fetchNodes()
  const modules = nodes.map((node) => {
    return new db.Module({
      name: node.name,
      description: 'Default module available in our editor.',
      type: 'BASIS',
      author: {
        id: user.id,
        name: [user.firstName, user.lastName].join(' '),
        internalId: user.internalId
      },
      version: node.version
    })
  })

  await db.Module.deleteMany({ type: 'BASIS' })

  await db.Module.insertMany(modules)

  return 'ok'
}
