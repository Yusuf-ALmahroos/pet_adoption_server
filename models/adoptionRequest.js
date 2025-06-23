const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  adopter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, required: true }
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema); 

// مادري لش مايبي يسوي بوش