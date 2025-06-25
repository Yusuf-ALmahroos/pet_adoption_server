const Comment = require('../models/Comment');
const middleware = require ('../middleware');

const createComment = async (req, res) => {
   try {
    const userId = res.locals.payload.id;
    const { petid, content} = req.body;
   } catch (error) {
    
   }
}