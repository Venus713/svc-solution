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
  type: {
    type: String
  },
  seats: {
    type: Number,
    required: true,
    default: 0
  },
  expiry: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  serial: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { autoIndex: true })

module.exports = mongoose.model('License', schema)
