import express from 'express';
import AdoptionRequest from '../models/AdoptionRequest.js';
import Pet from '../models/Pet.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateAdoptionRequest } from '../middleware/validation.js';

const router = express.Router();

// @desc    Create adoption request
// @route   POST /api/adoption-requests
// @access  Private (Adopter only)
router.post('/', protect, authorize('adopter'), validateAdoptionRequest, async (req, res) => {
  try {
    const { petId, message, adopterInfo } = req.body;

    // Check if pet exists and is available
    const pet = await Pet.findById(petId).populate('shelterId');
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Pet is not available for adoption'
      });
    }

    // Check if user already has a pending request for this pet
    const existingRequest = await AdoptionRequest.findOne({
      pet: petId,
      adopter: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this pet'
      });
    }

    const adoptionRequest = await AdoptionRequest.create({
      pet: petId,
      adopter: req.user.id,
      shelter: pet.shelterId._id,
      message,
      adopterInfo
    });

    await adoptionRequest.populate([
      { path: 'pet', select: 'name type breed images' },
      { path: 'adopter', select: 'name email phone' },
      { path: 'shelter', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      request: adoptionRequest
    });
  } catch (error) {
    console.error('Create adoption request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating adoption request'
    });
  }
});

// @desc    Get adopter's requests
// @route   GET /api/adoption-requests/adopter
// @access  Private (Adopter only)
router.get('/adopter', protect, authorize('adopter'), async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ adopter: req.user.id })
      .populate('pet', 'name type breed images status')
      .populate('shelter', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get adopter requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching adoption requests'
    });
  }
});

// @desc    Get shelter's requests
// @route   GET /api/adoption-requests/shelter
// @access  Private (Shelter only)
router.get('/shelter', protect, authorize('shelter'), async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ shelter: req.user.id })
      .populate('pet', 'name type breed images status')
      .populate('adopter', 'name email phone address')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get shelter requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching adoption requests'
    });
  }
});

// @desc    Update request status
// @route   PUT /api/adoption-requests/:id/status
// @access  Private (Shelter only)
router.put('/:id/status', protect, authorize('shelter'), async (req, res) => {
  try {
    const { status, responseMessage } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    // Make sure shelter owns this request
    if (request.shelter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update request
    request.status = status;
    request.responseMessage = responseMessage;
    request.reviewedAt = new Date();
    request.reviewedBy = req.user.id;
    await request.save();

    // If approved, update pet status and reject other pending requests
    if (status === 'approved') {
      await Pet.findByIdAndUpdate(request.pet, { status: 'Pending' });
      
      // Reject other pending requests for this pet
      await AdoptionRequest.updateMany(
        {
          pet: request.pet,
          _id: { $ne: request._id },
          status: 'pending'
        },
        {
          status: 'rejected',
          responseMessage: 'Pet has been adopted by another applicant',
          reviewedAt: new Date(),
          reviewedBy: req.user.id
        }
      );
    }

    await request.populate([
      { path: 'pet', select: 'name type breed images' },
      { path: 'adopter', select: 'name email phone' },
      { path: 'shelter', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating request status'
    });
  }
});

// @desc    Get single adoption request
// @route   GET /api/adoption-requests/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id)
      .populate('pet', 'name type breed images status')
      .populate('adopter', 'name email phone address')
      .populate('shelter', 'name email phone')
      .populate('reviewedBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    // Make sure user is either the adopter or the shelter
    if (request.adopter._id.toString() !== req.user.id && 
        request.shelter._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get adoption request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching adoption request'
    });
  }
});

export default router;