const mongoose = require('mongoose')
const { Schema } = mongoose
const uuid = require('uuid')

const schema = new Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4
  },
  name: {
    type: String
  },
  tags: [String],
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
  parent: {
    type: String,
    default: null,
  },
  version: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  gitRepository: {
    type: String,
  },
  status: {
    type: String,
    default: 'CLONING'
  },
  data:[
    new Schema({
      key: String,
      value: Schema.Types.Mixed
    })
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { autoIndex: true })

module.exports = mongoose.model('Module', schema)
