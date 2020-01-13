const mongoose = require('mongoose')
const { Schema } = mongoose
const uuid = require('uuid')

const schema = new Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4
  },
  parent: {
    type: String,
    default: null,
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
    type: Number,
    default: 0
  },
  flowId: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  author: {
    id: String,
    name: String,
    internalId: String
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // },
  // updatedAt: {
  //   type: Date,
  //   default: Date.now
  // }
}, { autoIndex: true, timestamps: true })

module.exports = mongoose.model('Profile', schema, 'profile')
