// Function to handle adding a new property listing
const User = require('../models/user');
const Property = require('../models/property');
const multer = require('multer');

// Create multer storage
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Create multer instance with the configured storage
const upload = multer({ storage: storage });

// Function to handle adding a new property listing
const addProperty = async (req, res) => {
  try {
      // Extract the property data from the request body
      const {
        title,
        category,
        area,
        price,
        rooms,
        beds,
        kitchens,
        bathrooms,
        neighbourhood,
        description,
        location,
        latitude,
        longitude
      } = req.body;
      const image = req.file;

      // Use the Google Maps Geocoding API to retrieve the coordinates
      const geocodingResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=AIzaSyDLozaUiJXyZrCkKPgdZzyHzmyTfhRLCQw`
      );
      const geocodingData = await geocodingResponse.json();

      if (
        geocodingData &&
        geocodingData.results &&
        geocodingData.results.length > 0
      ) {
        const coordinates = geocodingData.results[0].geometry.location;

      // Create a new property instance
      const newProperty = new Property({
        user: req.user._id,
        title,
        category,
        area,
        price,
        rooms,
        beds,
        kitchens,
        bathrooms,
        image:image.path,
        neighbourhood,
        description,
        location: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat],
        },
      });
    
      // Save the property to the database
      await newProperty.save();

      // Redirect or send a response indicating success
      res.redirect('/properties');
   } else {
        // Handle the case when geocoding data is not available
        console.error('Geocoding data not available');
        res.status(500).json({ message: 'Error retrieving property coordinates' });
      }
    
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addProperty
};
