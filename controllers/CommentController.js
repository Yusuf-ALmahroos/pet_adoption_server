const Comment = require('../models/Comment');

// Create a new comment
const CreateComment = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const { petId, content } = req.body;

    const newComment = await Comment.create({
      userId,
      petId,
      content
    });

    res.status(201).json(newComment); // Use 201 for successful creation
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating comment.' });
  }
};

// Get comments for a specific pet
const GetPetComment = async (req, res) => {
  try {
    const { petId } = req.params;

    const comments = await Comment.find({ petId })
      .populate('userId', 'name') // Populate user name
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching pet comments:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pet ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching comments.' });
  }
};

// Update a comment
const UpdateComment = async (req, res) => {
  try {
    const userId = res.locals.payload.id; // Access id from payload
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Check if the authenticated user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment.' });
    }

    comment.content = content;
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid comment ID format.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating comment.' });
  }
};

// Delete a comment
const DeleteComment = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Check if the authenticated user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid comment ID format.' });
    }
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
};

module.exports = {
  CreateComment,
  GetPetComment,
  UpdateComment,
  DeleteComment
};
