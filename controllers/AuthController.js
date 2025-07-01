const User = require('../models/User');
const middleware = require('../middleware');

// User Registration
const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const passwordDigest = await middleware.hashPassword(password);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'The email is already registered.' }); // Use 409 Conflict
    } else {
      const user = await User.create({ name, email, passwordDigest });
      res.status(201).json(user); // Use 201 for successful creation
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// User Login
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const matched = await middleware.comparePassword(
      password,
      user.passwordDigest
    );

    if (matched) {
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      const token = middleware.createToken(payload);
      return res.status(200).json({ user: payload, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Update user password
const UpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    let user = await User.findById(req.params.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const matched = await middleware.comparePassword(
      oldPassword,
      user.passwordDigest
    );

    if (matched) {
      const passwordDigest = await middleware.hashPassword(newPassword);
      const updatedUser = await User.findByIdAndUpdate(
        req.params.user_id,
        { passwordDigest },
        { new: true } // Return the updated document
      );

      const payload = {
        id: updatedUser.id,
        email: updatedUser.email
      };
      return res.status(200).json({ message: 'Password updated successfully.', user: payload });
    } else {
      return res.status(401).json({ message: 'Old password did not match.' });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    res.status(500).json({ message: 'Server error updating password.' });
  }
};

// Session check
const CheckSession = async (req, res) => {
  const { payload } = res.locals;
  res.status(200).json(payload);
};

module.exports = {
  Register,
  Login,
  UpdatePassword,
  CheckSession
};
