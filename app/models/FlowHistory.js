const mongoose = require('mongoose')
const { Schema } = mongoose
const uuid = require('uuid')

const schema = new Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4
  },
  flowId: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  data: Object,
  modules: [
    new Schema({
      id: String,
      name: String,
      version: String,
    })
  ],
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
  order: {
    type: Number
  },
  version: {
    type: String
  },
  parent: String,
  tags: {
    type: [String]
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

module.exports = mongoose.model('FlowHistory', schema, 'flow_histories')
