const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String },
  image: {type: String}, //URL
  isAdopted: { type: Boolean, default: false},
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Pet = mongoose.model('Pet', petSchema); 
module.exports = Pet;