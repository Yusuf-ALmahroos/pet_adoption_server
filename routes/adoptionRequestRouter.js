const router = require('express').Router();
const controller = require('../controllers/adoptController');
const middleware = require('../middleware');

router.post('/', 
    middleware.stripToken, 
    middleware.verifyToken,
    controller.createAdoptionRequest);

router.get('/adopter',     
  middleware.stripToken, 
  middleware.verifyToken,
  controller.getAdopterRequests);

router.get('/shelter',
  middleware.stripToken, 
  middleware.verifyToken,
  controller.getShelterRequests);

router.get('/:id', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.getAdoptionRequest);

module.exports = router;