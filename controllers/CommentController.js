const Comment = require('../models/Comment');

const CreateComment = async (req, res) => {
   try {
    const userId = res.locals.payload.id;
    const { petId, content} = req.body;
    const newComment = await Comment.create({
      userId,
      petId,
      content
    });

    res.status(201).send(newComment);
   } catch (error) {
    console.error(error);
    res.status(500).send({status: 'Error', msg: 'Failed comment.'});
   }
};

const GetPetComment = async (req, res) => {
   try {
      const {petId}= req.params;

      const comments = await Comment.find({petId})
      .populate('userId','name')
      .sort({createdAt: -1});

   res.status(200).send(comments);
   } catch (error) {
      console.error(error);
      res.status(500).send({status: 'Error', msg: 'Filed to see the comments.'});
      
   }
};


module.exports = {
   CreateComment,
   GetPetComment
};