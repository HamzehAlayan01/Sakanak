const mongoose = require('mongoose');
const bcrypt=require("bcryptjs");
// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});



//  userSchema.methods.validPassword = function (password) {
//    return bcrypt.compareSync(password, this.password);
//  };

// ...

// Create User model
const User = mongoose.model('User', userSchema);

module.exports = User;
