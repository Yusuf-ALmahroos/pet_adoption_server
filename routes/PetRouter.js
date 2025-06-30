const router = require('express').Router();
const controller = require('../controllers/PetController');
const middleware = require('../middleware')

router.get('/', controller.getAllPets);

router.get('/me',
  middleware.stripToken, 
  middleware.verifyToken, 
  controller.getUserPets);

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

router.put('/:id', (req, res) => {
  console.log("inside router ✅");
  res.send("OK");
});

module.exports = router;