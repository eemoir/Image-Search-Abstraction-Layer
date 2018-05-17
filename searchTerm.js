const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const searchSchema = new Schema(
  {
    searchTerm: String,
    searchDate: Date
  },
  {timestamps: true}
);

const modelClass = mongoose.model('image_searches', searchSchema);

module.exports = modelClass;