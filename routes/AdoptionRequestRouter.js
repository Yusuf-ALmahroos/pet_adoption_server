const router = require('express').Router();
const controller = require('../controllers/AdoptController');
const middleware = require('../middleware');

router.post('/', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.createRequest
);

router.get('/my',     
  middleware.stripToken, 
  middleware.verifyToken,
  controller.getMyRequests
);

router.get('/received',
  middleware.stripToken, 
  middleware.verifyToken,
  controller.getReceivedRequests
);

router.post('/respond/:requestId', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.resToRequest
);

module.exports = router;