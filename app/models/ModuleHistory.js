const mongoose = require('mongoose')
const { Schema } = mongoose
const uuid = require('uuid')

const schema = new Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4
  },
  moduleId: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String,
    default: null
  },
  type: {
    type: String
  },
  author: {
    id: String,
    name: String,
    internalId: String
  },
  version: {
    type: String
  },
  tags: [String],
  parent: {
    type: String,
    default: null,
  },
  order: {
    type: Number
  },
  gitRepository: {
    type: String,
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

module.exports = mongoose.model('ModuleHistory', schema, 'module_histories')
