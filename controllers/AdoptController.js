const AdoptionRequest = require('../models/AdoptionRequest.js');
const Pet = require('../models/Pet.js');

// Create a new adoption request
const createRequest = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const { petId, message } = req.body;

    // Validate petId format
    if (!petId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid pet ID format.' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    // Prevent users from requesting to adopt their own pets
    if (pet.ownerId.toString() === userId) {
      return res.status(400).json({ message: "You cannot adopt your own pet." });
    }

    // Check for existing request from the same user for the same pet
    const existingRequest = await AdoptionRequest.findOne({ petId, requesterId: userId });
    if (existingRequest) {
      return res.status(409).json({ message: "You have already submitted an adoption request for this pet." }); // Use 409 Conflict
    }

    const request = await AdoptionRequest.create({ petId, requesterId: userId, message });
    res.status(201).json(request); // Use 201 for successful creation
  } catch (error) {
    console.error('Error creating adoption request:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating adoption request.' });
  }
};

// Get adoption requests made by the authenticated user
const getMyRequests = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const requests = await AdoptionRequest.find({ requesterId: userId }).populate('petId');
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching user\'s adoption requests:', error);
    res.status(500).json({ message: 'Server error fetching your adoption requests.' });
  }
};

// Get adoption requests received for the authenticated user's pets (Shelter owner only)
const getReceivedRequests = async (req, res) => {
  try {
    const userId = res.locals.payload.id;
    const pets = await Pet.find({ ownerId: userId }).select('_id');
    const petIds = pets.map(p => p._id);

    const requests = await AdoptionRequest.find({ petId: { $in: petIds } })
      .populate('petId')
      .populate('requesterId', 'name email'); // Populate requester's name and email

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching received adoption requests:', error);
    res.status(500).json({ message: 'Server error fetching received adoption requests.' });
  }
};

// Respond to an adoption request (approve/reject) (Shelter owner only)
const resToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const userId = res.locals.payload.id;

    // Validate requestId format
    if (!requestId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid request ID format.' });
    }

    const request = await AdoptionRequest.findById(requestId).populate('petId');
    if (!request) {
      return res.status(404).json({ message: 'Adoption request not found.' });
    }

    // Check if the authenticated user is the owner of the pet associated with the request
    if (request.petId.ownerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this request.' });
    }

    // Validate status input
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided. Must be "approved" or "rejected".' });
    }

    request.status = status;
    await request.save();

    // If approved, mark the pet as adopted
    if (status === 'approved') {
      await Pet.findByIdAndUpdate(request.petId._id, { isAdopted: true });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Error responding to adoption request:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error responding to request.' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  resToRequest
};
}
