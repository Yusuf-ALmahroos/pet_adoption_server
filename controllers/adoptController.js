const AdoptionRequest = require('../models/AdoptionRequest.js');
const Pet             = require('../models/Pet.js')


const createAdoptionRequest = async (req, res) => {
  try {
    const { petId, message, adopterInfo } = req.body;

    const pet = await Pet.findById(petId).populate('shelterId');
    if (!pet) {
      return res.status(404).send('Pet not found');
    }

    const existingRequest = await AdoptionRequest.findOne({
      pet: petId,
      adopter: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).send('You already have a pending request for this pet');
    }

    const adoptionRequest = await AdoptionRequest.create({
      pet: petId,
      adopter: req.user.id,
      shelter: pet.shelterId._id,
      adopterInfo
    });


    res.status(201).send(adoptionRequest);
  } catch (error) {
    console.error('Create adoption request error:', error);
    res.status(500).send('Server error creating adoption request');
  }
};

const getAdopterRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ adopter: req.user.id })

    res.send(requests);
  } catch (error) {
    console.error('Get adopter requests error:', error);
    res.status(500).send('Server error fetching adoption requests');
  }
};

const getShelterRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ shelter: req.user.id })

    res.send(requests);
  } catch (error) {
    console.error('Get shelter requests error:', error);
    res.status(500).send('Server error fetching adoption requests');
  }
};

const getAdoptionRequest = async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).send('Adoption request not found');
    }

    if (request.adopter._id.toString() !== req.user.id && 
        request.shelter._id.toString() !== req.user.id) {
      return res.status(403).send('Not authorized to view this request');
    }

    res.send(request);
  } catch (error) {
    console.error('Get adoption request error:', error);
    res.status(500).send('Server error fetching adoption request');
  }
};

module.exports = {
  createAdoptionRequest,
  getAdopterRequests,
  getShelterRequests,
  getAdoptionRequest
}