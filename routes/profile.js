const express = require('express');
const router = express.Router();
const profileController=require('../controllers/profileController');
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      res.locals.isAuthenticated = true; 
      return next();
    }
    res.locals.isAuthenticated = false; 
    next(); // Redirect to the login page if not authenticated

    
  }
router.post('/addProfile', ensureAuthenticated, profileController.addProfile);