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
  tags: {
    type: [String]
  },
  category: {
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
    type: Number,
    default: 0
  },
  version: {
    type: String
  },
  parent: {
    type: String,
    default: null,
  }
}, { autoIndex: true })

module.exports = mongoose.model('Flow', schema)
