const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.post('/AddListing', propertyController.addProperty);

module.exports = router;
