const Comment = require('../models/Comment');

// user Comment
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

// user pet Comment
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

// user Update Comment
const UpdateComment =async (req,res) => {
   try {
      const userId = res.locals.payload;
      const {commentId} = req.params;
      const {content} = req.body;

      const comment = await Comment.findById(commentId);
     
      if(!comment) {
         return res.status(404).send({msg:'no comment!!'});
      }

      if(comment.userId.toString() !== userId) {
         return res.status(403).send({msg:'Unauthorized'});
      }

      comment.content = content;
      await comment.save();
      res.status(200).send(comment);

   } catch (error) {
      console.error(error);
      res.status(500).send({status: ' Error', msg: 'Faild to update!'})
   }
};

// user Delete Comment
const DeleteComment = async (req, res) => {
   try {
      const userId = res.locals.payload.id;
      const {commentId} = req.params;

      const comment = await Comment.findById(commentId);

      if (!comment) return res.status(404).send({msg:'no comment!'});

      if(comment.userId.toString() !== userId) {
         return res.status(403).send({msg:'Unauthorized'})
      }

      await comment.deleteOne();
      res.status(200).send({msg: 'Commen Deleted'})
   } catch (error) {
      console.error(error);
      res.status(500).send({status: 'Error' , msg : `Can't delete the comment`});
      
   }
};


module.exports = {
   CreateComment,
   GetPetComment,
   UpdateComment,
   DeleteComment
};