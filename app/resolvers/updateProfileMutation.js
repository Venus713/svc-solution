const { error } = require('lib-core')
const { isEmpty, has, omit, get } = require('lodash')
const graphqlFields = require('graphql-fields')
const path = require('path')
const versioningHelper = require(path.resolve('app', 'helpers', 'versioning'))

const getUpdateMode = async (db, profile, args) => {
  if(has(args, 'flowId') && args.flowId) {
    let newFlow, currentFlow

    if (args.flowId === profile.flowId) return 'PATCH'

    try {
      newFlow = await db.Flow.findOne({ _id: args.flowId })
    } catch (e) {
      return error(e)
    }

    try {
      currentFlow = await db.Flow.findOne({ _id: profile.flowId })
    } catch (e) {
      return error(e)
    }

    const hasSameFlowOrigin = (
      (newFlow.parent !== null && newFlow.parent === currentFlow.parent) ||
      newFlow.id === currentFlow.parent ||
      newFlow.parent === currentFlow.id
    )

    if (hasSameFlowOrigin) {
      return 'MINOR'
    } else {
      return 'MAJOR'
    }
  }

  return 'PATCH'
}

module.exports = async (args, { user, db, logger }, ast) => {
  const profile = await db.Profile.findOne({
    _id: args.id
  })

  if (isEmpty(profile)) {
    return error.NotFoundError()
  }

  if (!user.isOwner) {
    return error.AccessDeniedError()
  }

  if (has(args, 'name') && args.name !== profile.name) {
    const existingProfile = await db.Profile.findOne({ name: args.name })

    if (!isEmpty(existingProfile)) {
      const hasSameOrigin = (
        (profile.parent !== null && profile.parent === existingProfile.parent) ||
        profile.id === existingProfile.parent ||
        profile.parent === existingProfile.id
      )

      if (!hasSameOrigin) {
        return error('Profile with this name already exists.')
      }
    }
  }

  let currentFlow
  try {
    currentFlow = await db.Flow.findOne({ _id: profile.flowId })
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  if (currentFlow) {
    currentFlow = {
      id: currentFlow._id,
      name: currentFlow.name,
      version: currentFlow.version,
    }
  }

  const currentVersion = profile.version.toString()
  const updateMode = await getUpdateMode(db, profile, args)
  
  profile.version = versioningHelper.bumpVersion(currentVersion, updateMode)
  profile.set(args)

  const requestFields = graphqlFields(ast)
  let flow

  if (has(requestFields, 'flow')) {
    try {
      flow = await db.Flow.findOne({ _id: profile.flowId })
    } catch (e) {
      logger.error(e)
      return error(e)
    }
  }

  var change = args
  delete change.id

  const historyRecord = omit(
    Object.assign({}, profile.toJSON(), {
      profileId: profile._id,
      updatedBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      },
      flow: currentFlow,
      change: args,
    }),
    ['_id']
  )
  const history = new db.ProfileHistory(historyRecord)

  await history.save()
  
  profile.order += 1
  

  // const newProfileData = {
  //   ...profile._doc,
  //   parent: profile.parent ? profile.parent : profile.id
  // }

  // delete newProfileData._id
  // delete newProfileData.__v
  
  profile.parent = profile.parent ? profile.parent : profile.id

  // const newProfile = new db.Profile(newProfileData)  
  
  try {
    // await newProfile.save()
    await profile.save()
    
  } catch (e) {
    logger.error(e)
    return error(e)
  }

  if (flow) {
    newProfile.flow = {
      id: flow.id,
      name: flow.name,
      version: flow.version
    }
  }

  // TODO: Store changeset for audit.

  // return newProfile
  return profile
}
