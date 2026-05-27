const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Session lasts 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, accountType, dob } = req.body;

    // Validate request inputs
    if (!name || !email || !password || !phone || !address || !accountType || !dob) {
      return res.status(400).json({ success: false, message: 'All registration fields (name, email, password, phone, address, accountType, dob) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check for existing user email
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create new user (triggering pre-save password hashing and account number generation)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      accountType,
      dob,
    });

    if (user) {
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        accountType: user.accountType,
        dob: user.dob,
        accountNumber: user.accountNumber,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data provided.' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

// @desc    Authenticate user & retrieve token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    // Retrieve user and compare password
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        _id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
