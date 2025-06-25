const router = require('express').Router();
const controller = require('../controllers/petController.js');
const middleware = require('../middleware')

router.get('/all/', controller.getAllPets);

router.get('/:id', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.getPetById);

router.post('/', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.createPet
);

router.put('/:id', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.updatePet
);

router.delete('/:id', 
  middleware.stripToken, 
  middleware.verifyToken,
  controller.deletePet)

router.get('/shelter/my-pets',
  middleware.stripToken, 
  middleware.verifyToken, 
  controller.getShelterPets);

module.exports = router;