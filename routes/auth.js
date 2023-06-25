const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController=require('../controllers/profileController');

// POST /auth/register - Register a new user
router.post('/register', authController.registerUser);

// POST /auth/login - User login
router.post('/login', authController.authenticateUser);



module.exports = router;
