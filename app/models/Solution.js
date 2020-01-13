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
    type: String,
    required: true
  },
  enabled: Boolean,
  archive: {
    type: Boolean,
    default: false
  },
  data: Object,
  author: {
    id: String,
    name: String
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

module.exports = mongoose.model('Solution', schema)
