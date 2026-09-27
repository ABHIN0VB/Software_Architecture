const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'feastfleet_super_secret_jwt_key_2026_dev';

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }

  // Gracefully handle mock / demo tokens so demo users can place orders and browse freely
  if (token.startsWith('mock_') || token.startsWith('demo_') || token.startsWith('session_')) {
    req.user = {
      _id: '65f000000000000000000001',
      id: '65f000000000000000000001',
      name: 'Abhinav Babu',
      email: 'abhinav@feastfleet.com',
      phone: '9847123456'
    };
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // If server or in-memory DB restarted, supply demo fallback user
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: 'Abhinav Babu',
        email: 'abhinav@feastfleet.com',
        phone: '9847123456'
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized — token invalid' });
  }
};

// Optional auth — attaches user if token exists, but doesn't block
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid — continue without user
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
