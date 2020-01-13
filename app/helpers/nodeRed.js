const path = require('path')
const os = require('os')
const axios = require('axios').default
const git = require('simple-git/promise')
const { exec } = require('shelljs')
const { Module } = require(path.resolve('app', 'models'))
const { Logger } = require('lib-core').logger
const { error } = require('lib-core')
const { first, last, isEmpty } = require('lodash')
const publishingScript = path.resolve('config', 'scripts', 'publish.sh')
const { NODE_RED_URL } = process.env
const logger = Logger()

const installNodes = async ({ module }) => {
  const tempDirectory = `${os.tmpdir()}/${module.id}`

  try {
    let gitRepo = module.gitRepository
    let branch = 'master'
    if (gitRepo.includes('#')) {
      const gitRepoDestruct = gitRepo.split('#')
      gitRepo = first(gitRepoDestruct)
      branch = last(gitRepoDestruct)
    }

    const options = { branch }

    await git()
      .silent(true)
      .clone(gitRepo, tempDirectory, options)
  } catch (e) {
    console.error(e)
    logger.info(`module: ${module.id} - ${e}`)
    return Module.findOneAndUpdate({
      _id: module.id
    }, {
      $set: {
        status: 'ERROR'
      }
    })
  }

  await Module.findOneAndUpdate({
    _id: module.id
  }, {
    $set: {
      status: 'PUBLISHING'
    }
  })

  const child = exec(
    `sh ${publishingScript} ${tempDirectory}`,
    { async: true }
  )
  console.log(`sh ${publishingScript} ${tempDirectory}`)

  child.stderr.on('data', async (data) => {
    const stderr = data.toString()

    logger.info(`module: ${module.id} - ${stderr}`)

    await Module.findOneAndUpdate({
      _id: module.id
    }, {
      $set: {
        status: 'ERROR'
      }
    })
  })
  child.stdout.on('data', function (data) {
    const stdout = data.toString()
    console.log(stdout)
  })
  child.on('exit', async (exitCode) => {
    logger.info(`module: ${module.id} - exited with code ${exitCode}`)

    const status = exitCode === 0 ? 'PUBLISHED' : 'ERROR'

    await Module.findOneAndUpdate({
      _id: module.id
    }, {
      $set: {
        status
      }
    })

    if (exitCode === 0) {
      return installNodeOnToNodeRed({ module })
    }

    return exitCode
  })
}
const installNodeOnToNodeRed = async ({ module }) => {
  const data = { module: module.name }
  try {
    await Module.findOneAndUpdate({
      _id: module.id
    }, {
      $set: {
        status: 'INSTALLING'
      }
    })
    await axios.post(`${NODE_RED_URL}/nodes`, data)
    await Module.findOneAndUpdate({
      _id: module.id
    }, {
      $set: {
        status: 'INSTALLED'
      }
    })
  } catch (e) {
    console.error(e)
    logger.info(`module: ${module.id} - ${e}`)
    return Module.findOneAndUpdate({
      _id: module.id
    }, {
      $set: {
        status: 'ERROR'
      }
    })
  }
}

const fetchNodes = async () => {
  if (isEmpty(NODE_RED_URL)) {
    return error('Configuration malformed, missing NODE_RED_URL.')
  }

  const response = await axios({
    baseURL: NODE_RED_URL,
    method: 'get',
    url: 'nodes?_=' + Date.now,
    headers: {
      'Accept-Encoding': 'gzip, deflate',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Accept': 'application/json',
      'Node-RED-API-Version': 'v2',
      'Connection': 'keep-alive'
    }
  })

  return response.data
}

module.exports = { fetchNodes, installNodes }
