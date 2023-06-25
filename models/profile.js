const mongoose = require('mongoose');

// Define Profile Schema
const profileSchema = new mongoose.Schema({
  image: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  lookingFor: {
    type: String,
    required: true
  },
  age:{
    type:String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // social: {
  //   facebook:{
  //     type: String
  //   },
  //   instagram:{
  //     type:String
  //   },
  //   linkenin: {
  //     type:String
  //   }
  // },
 

});

// Create Profile model
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
