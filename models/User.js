const mongoose = require('mongoose');

const userSchema = new mongoose.Schema (
    {
        name : {type: String, required: true},
        email : {type: String, required: true, unique: true},

        pets: [{type: mongoose.Schema.Types.ObjectId, ref:'Pet' }],

        passwordDigest : {type: String, required: true}
    },
    {timestamps: true}
);

const User = mongoose.model('User', userSchema);

module.exports = User;