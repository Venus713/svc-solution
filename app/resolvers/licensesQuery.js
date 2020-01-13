const { has, map, reduce } = require('lodash')
const { error } = require('lib-core')
const graphqlFields = require('graphql-fields')

const MOCK_DATA = [
  {
    "id": "f3a9bf4b-f66e-4a4e-881f-489fc0f21a68",
    "active": true,
    "name": "KLM09-AEC18",
    "serial": "IG**-****-****-R8L1",
    "seats": 240,
    "expiry": "2019-11-27T07:36:14.751Z",
    "type": "Device",
    "createdAt": "2019-11-27T07:36:14.751Z",
    "updatedAt": "2019-11-27T07:36:14.751Z"
  },
  {
    "id": "3b782de8-1bc0-4607-942d-253604c20f97",
    "active": true,
    "name": "KLM09-AEC08",
    "serial": "XJ**-****-****-ZUE5",
    "seats": 200,
    "expiry": "2019-11-27T07:36:47.323Z",
    "type": "User",
    "createdAt": "2019-11-27T07:36:47.323Z",
    "updatedAt": "2019-11-27T07:36:47.323Z"
  },
  {
    "id": "50c19d01-8acb-42fe-b469-9833f1c9e5b6",
    "active": true,
    "name": "ADM09-AEC08",
    "serial": "N4**-****-****-I27R",
    "seats": 390,
    "expiry": "2019-11-27T07:37:01.075Z",
    "type": "Report",
    "createdAt": "2019-11-27T07:37:01.075Z",
    "updatedAt": "2019-11-27T07:37:01.075Z"
  },
  {
    "id": "4d6a941c-55b0-4b0b-9be6-6b69b1b5a58b",
    "active": true,
    "name": "ACM09-DEC8",
    "serial": "QV**-****-****-DLY6",
    "seats": 119,
    "expiry": "2019-11-27T07:37:31.572Z",
    "type": "Device",
    "createdAt": "2019-11-27T07:37:31.572Z",
    "updatedAt": "2019-11-27T07:37:31.572Z"
  },
  {
    "id": "a45d0533-6267-46be-9df3-87bcd08977c8",
    "active": true,
    "name": "ACM09-ATG71",
    "serial": "DK**-****-****-CZVE",
    "seats": 330,
    "expiry": "2019-11-27T07:37:50.147Z",
    "type": "User",
    "createdAt": "2019-11-27T07:37:50.147Z",
    "updatedAt": "2019-11-27T07:37:50.147Z"
  }
]

module.exports = async (args, { token, user, db }, ast) => {
  if (user.isAnonymous) {
    return error.AccessDeniedError()
  }

  const licenseCount = await db.License.countDocuments()

  if (licenseCount == 0) {
    return {
      count: 5,
      data: MOCK_DATA
    }
  }

  const requestFields = graphqlFields(ast)
  const { limit, offset } = args
  const query = {}
  const sort = reduce(
    map(args.sort, (row) => ({ [ row.field ]: row.type.toLowerCase() })),
    (acc, value) => ({ ...acc, ...value })
  )

  if (has(args, 'id')) {
    query._id = { $in: args.id }
  }

  let [ count, data ] = await Promise.all([
    db.License.countDocuments(query),
    db.License.find(query).sort(sort).limit(limit).skip(offset)
  ])

  if (has(requestFields, 'data.serial')) {
    data.forEach(license => {
      const { serial } = license

      if (serial) {
        license.serial = `${serial.slice(0, 2)}**-****-****-${serial.slice(15)}`
      }
    })
  }

  return { count, data }
}
