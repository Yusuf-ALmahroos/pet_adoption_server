const Pet = require('../models/Pet.js');

// Get all pets
const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({});
    res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching all pets:', error);
    res.status(500).json({ message: 'Server error fetching pets.' });
  }
};

// Get pet by ID
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }
    res.status(200).json(pet);
  } catch (error) {
    console.error('Error fetching pet by ID:', error);
    // Check if the error is due to an invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pet ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching pet.' });
  }
};

// Create a new pet listing
const createPet = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const petData = {
      ...req.body,
      ownerId: userId
    };

    const pet = await Pet.create(petData);

    res.status(201).json(pet); // Use 201 for successful creation
  } catch (error) {
    console.error('Error creating pet:', error);
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating pet.' });
  }
};

// Update a pet listing (Shelter owner only)
const updatePet = async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    // Check if the authenticated user is the owner of the pet
    if (pet.ownerId.toString() !== res.locals.payload.id) {
      return res.status(403).json({ message: 'Not authorized to update this pet.' }); // Use 403 Forbidden
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    console.log('Pet updated:', pet);
    return res.status(200).json(pet);
  } catch (error) {
    console.error('Error updating pet:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pet ID format.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating pet.' });
  }
};

// Delete a pet listing (Shelter owner only)
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    // Check if the authenticated user is the owner of the pet
    if (pet.ownerId.toString() !== res.locals.payload.id) {
      return res.status(403).json({ message: 'Not authorized to delete this pet.' });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Pet deleted successfully.' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pet ID format.' });
    }
    res.status(500).json({ message: 'Server error deleting pet.' });
  }
};

// Get pets owned by the authenticated user (Shelter owner only)
const getUserPets = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const pets = await Pet.find({ ownerId: userId });
    res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({ message: 'Server error fetching user pets.' });
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
