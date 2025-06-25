import express from 'express';
import Pet from '../models/Pet.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { validatePet } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all pets
// @route   GET /api/pets
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      type,
      breed,
      age,
      size,
      location,
      status = 'Available',
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { status };

    if (type) query.type = type;
    if (breed) query.breed = new RegExp(breed, 'i');
    if (age) {
      const ageRange = age.split('-');
      if (ageRange.length === 2) {
        query.age = { $gte: parseInt(ageRange[0]), $lte: parseInt(ageRange[1]) };
      } else {
        query.age = parseInt(age);
      }
    }
    if (size) query.size = size;
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') }
      ];
    }

    const pets = await Pet.find(query)
      .populate('shelterId', 'name email phone address')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pet.countDocuments(query);

    res.json({
      success: true,
      count: pets.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      pets
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pets'
    });
  }
});

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('shelterId', 'name email phone address');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      pet
    });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pet'
    });
  }
});

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private (Shelter only)
router.post('/', protect, authorize('shelter'), uploadImages, validatePet, async (req, res) => {
  try {
    const petData = {
      ...req.body,
      shelterId: req.user.id
    };

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      petData.images = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        isMain: index === 0 // First image is main
      }));
    }

    const pet = await Pet.create(petData);
    await pet.populate('shelterId', 'name email phone address');

    res.status(201).json({
      success: true,
      pet
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating pet'
    });
  }
});

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private (Shelter owner only)
router.put('/:id', protect, authorize('shelter'), uploadImages, async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Make sure shelter owns pet
    if (pet.shelterId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        isMain: pet.images.length === 0 && index === 0 // First image is main if no existing images
      }));
      req.body.images = [...(pet.images || []), ...newImages];
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('shelterId', 'name email phone address');

    res.json({
      success: true,
      pet
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating pet'
    });
  }
});

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private (Shelter owner only)
router.delete('/:id', protect, authorize('shelter'), async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Make sure shelter owns pet
    if (pet.shelterId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pet'
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting pet'
    });
  }
});

// @desc    Get shelter's pets
// @route   GET /api/pets/shelter/my-pets
// @access  Private (Shelter only)
router.get('/shelter/my-pets', protect, authorize('shelter'), async (req, res) => {
  try {
    const pets = await Pet.find({ shelterId: req.user.id })
      .sort('-createdAt')
      .populate('shelterId', 'name email phone');

    res.json({
      success: true,
      count: pets.length,
      pets
    });
  } catch (error) {
    console.error('Get shelter pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shelter pets'
    });
  }
});

export default router;