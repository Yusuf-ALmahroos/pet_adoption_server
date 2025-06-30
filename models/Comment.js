const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema (
    {
        userId:{type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
        petId: {type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true},
        content:{type:String, require: true}
    }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;