const mongoose = require('mongoose')
const { Schema } = mongoose
const uuid = require('uuid')

const schema = new Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4
  },
  profileId: {
    type: String
  },
  tags: {
    type: [String]
  },
  description: {
    type: String
  },
  version: {
    type: String
  },
  order: {
    type: Number
  },
  flowId: {
    type: String
  },
  flow: {
    id: String,
    name: String,
    version: String
  },
  change: Object,
  name: {
    type: String,
    required: true
  },
  author: {
    id: String,
    name: String,
    internalId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    id: {
      type: String
    },
    name: {
      type: String
    }
  }
}, { autoIndex: true })

module.exports = mongoose.model('ProfileHistory', schema, 'profile_histories')
