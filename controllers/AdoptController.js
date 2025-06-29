const AdoptionRequest = require('../models/AdoptionRequest.js');
const Pet = require('../models/Pet.js');


const createRequest = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const { petId, message} = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).send('pet not found');

    if (pet.ownerId.toString() === userId) {
      return res.status(400).send("You can't adopt your pet !!!????")
    }

    const existing = await AdoptionRequest.findOne({petId, requesterId: userId});
    if (existing) return res.status(400).send("You alredy requested!!");

    const request = await AdoptionRequest.create({petId, requesterId: userId, message});
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
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
  createRequest,
  getAdopterRequests,
  getShelterRequests,
  getAdoptionRequest
}