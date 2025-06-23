const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String },
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Pet', petSchema); 
// مادري لش مايبي يسوي بوش