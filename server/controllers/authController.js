const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @returns {String} - JWT Token
 */
const JWT_SECRET = process.env.JWT_SECRET || 'feastfleet_super_secret_jwt_key_2026_dev';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @returns {String} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      // If user already exists and password matches, log them in
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
          }
        });
      }
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanIdentity = email.trim().toLowerCase();
    // Allow login by email or phone
    let user = await User.findOne({
      $or: [{ email: cleanIdentity }, { phone: cleanIdentity }]
    }).select('+password');

    // Auto-create demo accounts if not found
    if (!user && (cleanIdentity.includes('abhinav') || cleanIdentity.includes('demo'))) {
      user = await User.create({
        name: cleanIdentity.includes('abhinav') ? 'Abhinav Babu' : 'Demo User',
        email: cleanIdentity.includes('@') ? cleanIdentity : `${cleanIdentity}@feastfleet.com`,
        password: password || 'password123',
        phone: '9847123456'
      });
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, notFound: true, message: 'Account not found. Please sign up or try Demo login.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;

    const user = req.user;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
