const AdoptionRequest = require('../models/AdoptionRequest.js');
const Pet = require('../models/Pet.js');
const User = require('../models/User.js');


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

const getMyRequests = async (req, res) => {   
 try {
  const userId = res.locals.payload.id;
  const requests = await AdoptionRequest.find({requesterId: userId}).populate('petId');
  res.json(requests);
 } catch (error) {
  console.error(error);
  res.status(500).send('Server Error');
 }
};

const getReceivedRequests = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const pets = await Pet.find({ownerId: userId}).select('_id');
    const petIds = pets.map(p => p._id);

    const requests =await AdoptionRequest.find({petId: {$in: petIds}})
    .populate('petId')
    .populate('requesterId');

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const resToRequest = async (req, res) => {
try {
  const {requestId} = req.params;
  const {status} = req.body; //approve or no
  const userId = res.locals.payload.id;

  const request = await AdoptionRequest.findById(requestId).populate('petId');
  if(!request) return res.status(404).send('no Request found');

  if (request.petId.ownerId.toString() !== userId) {
    return res.status(403).send('Not Authorized');
  }

  request.status = status;
  await request.save();

  if (status === 'approved') {
    const newPet = await Pet.findByIdAndUpdate(request.petId._id, { isAdopted: true, ownerId: userId});
    const newUser = await User.findById(request.requesterId);
    const oldUser = await User.findById(userId);
    newUser.pets.push(newPet._id);
    const index = oldUser.pets.indexOf(newPet._id);
    oldUser.pets.splice(index, 1);
    newPet.ownerId = newUser._id;
    await oldUser.save();
    await newUser.save();
    await newPet.save();
    await AdoptionRequest.findByIdAndDelete(requestId)
  }
  else if (status === 'rejected') {
    await AdoptionRequest.findByIdAndDelete(requestId)
  }

  res.send(request);
} catch (error) {
  console.error(error);
  res.status(500).send('Server error');
}

};

module.exports = {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  resToRequest
}