const mongoose = require('mongoose')
const { Schema } = mongoose
const schema = new Schema({
  _id: {
    type: String,
    required: true
  },
  sequenceValue: {
    type: Number,
    default: 0
  },
  key: {
    type: String
  },
  value: {
    type: String
  }
})

module.exports = mongoose.model('Counter', schema)
