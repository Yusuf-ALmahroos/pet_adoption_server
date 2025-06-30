const Pet = require('../models/Pet.js');

// all pet
const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({});
    res.status(200).send(pets);
  } catch (error) {
    console.error('Get all pets error:', error);
    res.status(500);
  }
};


 const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)

    if (!pet) {
      return res.status(400).send("Pet id Not founds");
    }
    res.send(pet);
  } catch (error) {
    console.error('Gt pet error:', error);
    res.status(400).send('Server error fetching pet');
  }
};

 const createPet = async (req, res) => {
  try {

    const userId = res.locals.payload.id;  
    const petData = {
      ...req.body,
      ownerId : userId
    };

    const pet = await Pet.create(petData);

    res.status(200).send(pet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(401).send("error in creating a pet");
  }
};

 const updatePet = async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).send("pet not found");
    }

    // shelter owns pet
    if (pet.ownerId.toString() !== res.locals.payload.id) {
      return res.status(401).send("Not authorized to update this pet");
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    console.log('Pet updated:', pet);

    return res.status(200).json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).send('Server error updating pet');
  }
};

// (Shelter owner only)
 const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).send('Pet not found');
    }

    // shelter owns pet
    if (pet.ownerId.toString() !== res.locals.payload.id) {
      return res.status(403).send('Not authorized to delete this pet');
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.send('Pet deleted successfully');
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).send('Server error deleting pet');
  }
};


 const getUserPets = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const pets = await Pet.find({ ownerId: userId })
    res.status(200).send(pets);
  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).send('error fatching user pet')
  }
};


module.exports = {
  getAllPets, 
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getUserPets
}