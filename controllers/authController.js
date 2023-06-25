const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport=require("passport");
const LocalStrategy = require('passport-local').Strategy;



const registerUser = async (req, res) => {
  try {
    const { username, firstName, lastName, phoneNumber, email, password, confirmPassword } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('<script>alert("Email already exists"); window.location.href = "/register.html";</script>');
      r
    }

    // Validate input fields
    if (!username || !firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
      return res.send('<script>alert("All fields are required"); window.location.href = "/register.html";</script>');
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.send('<script>alert("Passwords do not match"); window.location.href = "/register.html";</script>');
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.send('<script>alert("Invalid email format"); window.location.href = "/register.html";</script>');
    }

    // Validate password complexity using regex
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.send('<script>alert("Password must contain at least 8 characters including a letter and a digit"); window.location.href = "/register.html";</script>');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      username,
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, 'your-secret-key-goes-here', { expiresIn: '1h' });

    return res.send('<script>alert("Registration successful"); window.location.href = "/signin.html";</script>');

    // res.redirect("/signin.html");
    // Generate a JSON Web Token (JWT)

    // Return the token and user details in the response
    // res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.send('<script>alert("Internal server error"); window.location.href = "/register.html";</script>');
  }
};


  const loginUser = (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        console.error('Error logging in:', err);
        return res.send('<script>alert("Internal server error"); window.location.href = "/signin.html";</script>');
      }
      if (!user) {
        return res.send('<script>alert("Invalid email or password"); window.location.href = "/signin.html";</script>');
      }
      if (req.body.password !== user.password) {
        return res.send('<script>alert("Invalid email or password"); window.location.href = "/signin.html";</script>');
      }

      req.login(user, function(err) {
        if (err) {
          console.error('Error logging in:', err);
          return res.send('<script>alert("Internal server error"); window.location.href = "/signin.html";</script>');
        }

        // Generate a JSON Web Token (JWT)
        const token = jwt.sign({ userId: user._id }, 'your-secret-key-goes-here', { expiresIn: '1h' });

        // Return the token and user details in the response
        res.status(200).json({ token, user });
      });
    })(req, res, next);
  };
  const logoutUser = (req, res) => {
    req.logout(function (err) {
      if (err) {
        console.error('Error logging out:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      // Redirect to the login page or any other appropriate page
      res.redirect('/signin.html');
    });
  };
  
  module.exports = {
    // Other controller methods...
    logoutUser,
  };
  

  const authenticateUser = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin.html',
  });

module.exports = {
  registerUser,
  loginUser,
  authenticateUser,
 logoutUser
};


// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user exists in the database
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Verify the password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Generate a JSON Web Token (JWT)
//     const token = jwt.sign({ userId: user._id }, 'your-secret-key-goes-here', { expiresIn: '1h' });



//     // Return the token and user details in the response
//     res.status(200).json({ token, user });
//     res.redirect('/');


//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

  
