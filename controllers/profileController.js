const Profile = require('../models/profile');
const User = require('../models/user');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: 'public/uploads/', // Specify the directory to store uploaded files
  filename: function (req, file, cb) {
    // Set the filename to a unique value, e.g., a timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

// Create a multer instance with the configured storage
const upload = multer({ storage: storage });

const addProfile = async (req, res) => {
  try {

      const { name, specialization, lookingFor, age, budget, location, phoneNumber } = req.body;
      const image = req.file;

      // Create a new profile instance
      const newProfile = new Profile({
        user: req.user._id,
        name,
        specialization,
        lookingFor,
        age,
        budget,
        location,
        phoneNumber,
        image: image.path,
      });

      // Save the profile to the database
      await newProfile.save();

      res.redirect('/Roommates'); // Redirect to the homepage or any other page
    }
   catch (error) {
    console.error('Error adding profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addProfile,
};
