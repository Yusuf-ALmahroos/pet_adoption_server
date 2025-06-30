const router = require('express').Router();
const commentController = require('../controllers/CommentController');
const middleware = require('../middleware');

router.post('/', middleware.stripToken, middleware.verifyToken, commentController.CreateComment);
router.get('pet/:petId', commentController.GetPetComment);
router.put('/:commentId', middleware.stripToken, middleware.verifyToken, commentController.DeleteComment);

module.exports = router;