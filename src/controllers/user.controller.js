const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/baseResponse.util');

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  if (password.length < 8) {
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  if (!/[0-9]/.test(password)) {
    return false;
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return false;
  }
  return true;
};

const weakPasswordMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.';

const UserController = {
  register: async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json(errorResponse('Username, email, and password are required'));
    }

    if (!isValidEmail(email)) {
        return res.status(400).json(errorResponse('Invalid email format'));
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json(errorResponse(weakPasswordMessage));
    }

    try {
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json(errorResponse('Username already exists'));
      }

      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
          return res.status(409).json(errorResponse('Email already exists'));
      }

      const newUser = await User.create(username, email, password);

      const token = jwt.sign({ id: newUser.id, username: newUser.username }, jwtSecret, { expiresIn: '1h' });

       const userWithoutPassword = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          created_at: newUser.created_at
      };

      res.status(201).json(successResponse({ user: userWithoutPassword, token }, 'User registered successfully'));
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json(errorResponse('Invalid credentials'));
      }

      const isPasswordValid = await User.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json(errorResponse('Wrong Password'));
      }

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });

      const userWithoutPassword = {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
      };

      res.json(successResponse({ user: userWithoutPassword, token }, 'Login successful'));
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },

  getProfile: async (req, res) => {
    const userId = req.user.id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json(errorResponse('User not found'));
      }
      res.json(successResponse(user));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },

  updateAccount: async (req, res) => {
    const userId = req.user.id;
    const { username, email, password } = req.body;

    if (username === undefined && email === undefined && password === undefined) {
        return res.status(400).json(errorResponse('No update data provided'));
    }

    try {
        if (username !== undefined) {
            const existingUser = await User.findByUsername(username);
            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json(errorResponse('Username already taken'));
            }
        }

         if (email !== undefined) {
            if (!isValidEmail(email)) {
                return res.status(400).json(errorResponse('Invalid email format'));
            }
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json(errorResponse('Email already taken'));
            }
        }

        if (password !== undefined) {
            if (!isStrongPassword(password)) {
                return res.status(400).json(errorResponse(weakPasswordMessage));
            }
        }

        const updatedUser = await User.update(userId, username, email, password);

        if (!updatedUser) {
             return res.status(400).json(errorResponse('Invalid update data'));
        }

        res.json(successResponse(updatedUser, 'Account updated successfully'));

    } catch (error) {
        console.error('Error updating user account:', error);
        res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },

  deleteAccount: async (req, res) => {
    const userId = req.user.id;

    try {
      const deletedUser = await User.delete(userId);
      if (!deletedUser) {
        return res.status(404).json(errorResponse('User not found'));
      }
      res.json(successResponse(null, 'Account deleted successfully'));
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },

  getTodoStats: async (req, res) => {
    const userId = req.user.id;

    try {
      const stats = await User.getTodoStats(userId);
      res.json(successResponse(stats));
    } catch (error) {
      console.error('Error fetching user todo stats:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },
};

module.exports = UserController;