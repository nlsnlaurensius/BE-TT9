const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.get('/profile', authenticateToken, UserController.getProfile);

router.put('/account', authenticateToken, UserController.updateAccount);

router.delete('/account', authenticateToken, UserController.deleteAccount);

router.get('/stats/todos', authenticateToken, UserController.getTodoStats);

module.exports = router;