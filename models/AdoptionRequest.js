const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: {
     type: String,
     enum: ['pending', 'approved', 'rejected'],
     default: 'pending'
    },
    message: {type : String},

}, {timestamps: true});

const AdoptionRequest = mongoose.model('AdoptionRequest', adoptionRequestSchema); 
module.exports = AdoptionRequest;