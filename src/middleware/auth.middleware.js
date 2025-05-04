const jwt = require('jsonwebtoken');
require('dotenv').config();
const { errorResponse } = require('../utils/baseResponse.util');

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json(errorResponse('Authentication token required'));
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json(errorResponse('Invalid or expired token'));
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;