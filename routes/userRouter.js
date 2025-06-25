import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();


router.get('/shelters', async (req, res) => {
  try {
    const shelters = await User.find({ role: 'shelter' })
      .select('name email phone address profileImage createdAt')
      .sort('name');

    res.json({
      success: true,
      count: shelters.length,
      shelters
    });
  } catch (error) {
    console.error('Get shelters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shelters'
    });
  }
});


router.get('/shelters/:id', async (req, res) => {
  try {
    const shelter = await User.findOne({ 
      _id: req.params.id, 
      role: 'shelter' 
    }).select('name email phone address profileImage createdAt');

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found'
      });
    }

    res.json({
      success: true,
      shelter
    });
  } catch (error) {
    console.error('Get shelter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shelter'
    });
  }
});

export default router;