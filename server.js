  const express=require("express");
  const mongoose=require("mongoose");
  const bodyParser=require("body-parser");
  const path = require("path"); //
  const app=express();
  const authRoutes=require("./routes/auth");
  const session=require("express-session");
  const passport=require("passport");
  const passportLocalMongoose=require("passport-local-mongoose");
  const LocalStrategy = require('passport-local').Strategy;
  const User = require('./models/user');
  const bcrypt=require("bcryptjs");
  const profileController = require('./controllers/profileController');
  const Profile = require('./models/profile');
  const multer=require("multer");
  const propertyController=require('./controllers/propertyController');
  const Property=require('./models/property');
  const authController=require("./controllers/authController");
  const nodemailer = require('nodemailer');



  mongoose.connect('mongodb+srv://hamzehalayan:RvXLXO1as3DXCYFp@cluster0.erxwlfs.mongodb.net/<database-name>?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB Atlas');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
  });
    // mongoose.connect("mongodb://localhost:27017/sakanakDB",{useNewUrlParser:true });
  const db=mongoose.connection;

  app.set('view engine', 'ejs');
  //  app.use(express.static(path.join(__dirname, "public")));
  //   app.use(express.static('public'));
  // app.use(express.static('public', { extensions: ['html', 'css'] }));


  app.use(express.static(__dirname + '/public'));

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  const upload = multer({ storage: storage });

  //initialize passport and session middleware
  app.use(require("express-session")({
    secret: "your-secret-key-goes-here",
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    {
      usernameField: 'email', // Assuming email is used for authentication
      passwordField: 'password',
    },
    function(email, password, done) {
      // Implement your logic to find and validate the user
      User.findOne({ email }).exec()
        .then((user) => {
          if (!user) {
            return done(null, false);
          }

          return bcrypt.compare(password, user.password)
            .then((isMatch) => {
              if (!isMatch) {
                return done(null, false);
              }

              return done(null, user);
            });
        })
        .catch((err) => done(err));
    }
  ));
  // Serialization
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // Deserialization
  passport.deserializeUser(function(id, done) {
    User.findById(id).exec()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  });



  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      res.locals.isAuthenticated = true; // Set user status as logged in
      return next();
    }
    res.locals.isAuthenticated = false; // Set user status as not logged in
    next(); // Redirect to the login page if not authenticated

    //res.redirect('/signin.html');
  }

  app.use(ensureAuthenticated);


  app.use(bodyParser.urlencoded({extended:true}));
  app.use(bodyParser.json());
  app.use("/auth", authRoutes);

  // app.set('view engine', 'ejs');

  
  app.get("/", ensureAuthenticated ,(req, res) => {
    res.render("index", { isAuthenticated: res.locals.isAuthenticated });
      //res.sendFile(path.join(_  _dirname, "public", "index.html"));
      
    });


    app.get("/index", ensureAuthenticated ,(req, res) => {
    res.render("index", { isAuthenticated: res.locals.isAuthenticated });
      //res.sendFile(path.join(_  _dirname, "public", "index.html"));
    });

    app.get("/signin", ensureAuthenticated, (req, res) => {
      res.render("signin", { isAuthenticated: res.locals.isAuthenticated });
    });
    
    app.get("/register", ensureAuthenticated,(req, res) => {
      res.render("register", { isAuthenticated: res.locals.isAuthenticated });
    });
   
    app.get("/Roommates", ensureAuthenticated, async (req, res) => {
      try {
        if (!req.user) {
          // Redirect to login or handle unauthorized access
          return res.redirect("/signin.html");
        }

        const profiles = await Profile.find().populate('user').sort({ createdAt: -1 });
    
        if (!profiles) {
          return res.render("NoProfile");
        }
    
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 6; // Number of profiles per page
    
        const totalPages = Math.ceil(profiles.length / perPage);
    
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = currentPage * perPage;
        const paginatedProfiles = profiles.slice(startIndex, endIndex);
    
        res.render("Roommates", {
          isAuthenticated: res.locals.isAuthenticated,
          profiles: paginatedProfiles,
          loggedInUserId: req.user._id.toString(),
          currentPage: currentPage,
          totalPages: totalPages,
        });
      } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    const googleMapsApiKey = "AIzaSyDLozaUiJXyZrCkKPgdZzyHzmyTfhRLCQw";

    app.get('/AddListing', ensureAuthenticated, (req, res) => {
      if (!req.user) {
        // Redirect to login or handle unauthorized access
        return res.redirect("/signin.html");
      }
      res.render('AddListing', { 
        isAuthenticated: res.locals.isAuthenticated,
        googleMapsApiKey: googleMapsApiKey
      });
    });
    app.post("/AddListing", ensureAuthenticated, upload.single('image'), async (req, res) => {
      try {
        // Call the addProperty function from the propertyController passing the request and response objects
        await propertyController.addProperty(req, res);
      } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
  });
  app.get('/MyProfile', ensureAuthenticated, async (req, res) => {
      if (!req.user) {
        // Redirect to login or handle unauthorized access
        return res.redirect("/signin.html");
      }
  
    try {
      // Retrieve the logged-in user's information from the database
      const user = await User.findById(req.user._id);
  
      if (!user) {
        // Handle the case when user data is not found
        console.error('User not found');
        return res.status(500).json({ message: 'Error retrieving user data' });
      }
  
      // Render the MyProfile page with the user's data
      res.render('MyProfile', {
        isAuthenticated: res.locals.isAuthenticated,
        user: user
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

    app.get('/MyProperties', ensureAuthenticated, async (req, res) => {
      if (!req.user) {
        // Redirect to login or handle unauthorized access
        return res.redirect("/signin.html");
      }
      
      try {
        const page = parseInt(req.query.page) || 1; // get the page number from query parameters
        const limit = 6; // number of properties per page
        const skip = (page - 1) * limit; // number of documents to skip
    
        // Fetch properties added by the logged-in user from the database
        const properties = await Property.find({ user: req.user._id })
          .populate('user')
          .sort({ createdAt: -1 }) // sort properties by creation date in descending order
          .skip(skip)
          .limit(limit);
    
        // Count the total number of properties added by the user
        const total = await Property.countDocuments({ user: req.user._id });
    
        if (properties.length === 0) {
          // User has not added any properties yet
          return res.render("noProperties", {
            isAuthenticated: res.locals.isAuthenticated,
            message: 'You have not added any properties yet.'
          });
        }
    
        
        // User has added properties, render the MyProperties page with the properties data
        res.render('MyProperties', {
          isAuthenticated: res.locals.isAuthenticated,
          properties: properties,
          currentPage: page, // current page number
          totalPages: Math.ceil(total / limit), // total number of pages
        });
      } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
    app.get('/properties-detail/:propertyId', ensureAuthenticated, async (req, res) => {
      try {
        const propertyId = req.params.propertyId;
    
        // Find the property by its ID and populate the user details
        const property = await Property.findById(propertyId).populate('user');
    
        if (!property) {
          // Property not found
          return res.status(404).render('error', { isAuthenticated: res.locals.isAuthenticated, message: 'Property not found' });
        }
    
        // Render the properties-detail page with the property data
        res.render('properties-detail', {
          isAuthenticated: res.locals.isAuthenticated,
          property: property,
          googleMapsApiKey: googleMapsApiKey
        });
      } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.get('/properties', ensureAuthenticated, async (req, res) => {
      if (!req.user) {
        // Redirect to login or handle unauthorized access
        return res.redirect("/signin.html");
      }
      console.log(req.query)
      try {
        var neighbourhood = req.query.neighbourhood;
        var category = req.query.category;
        var areaLower = req.query.areaLower;
        var areaUpper = req.query.areaUpper;
        var priceLower = req.query.priceLower;
        var priceUpper = req.query.priceUpper;    
    
        var neighbourhoodRegex = new RegExp(neighbourhood, 'i');
        var categoryRegex = new RegExp(category, 'i');
    
        // Define the query object
        const query = {
          ...(neighbourhood && { neighbourhood: { $regex: neighbourhoodRegex } }),
          ...(category && { category: { $regex: categoryRegex } }),
          ...(priceLower && priceUpper && { price: { $gte: Number(priceLower), $lte: Number(priceUpper) } }),
          ...(areaLower && areaUpper && { area: { $gte: Number(areaLower), $lte: Number(areaUpper) } }),
        };
    
        // Fetch properties from the database based on search parameters or fetch all properties
        const properties = await Property.find(query)
          .populate('user')
          .sort({ createdAt: -1 });
    
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 6; // Number of properties per page
    
        const totalPages = Math.ceil(properties.length / perPage);
    
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = currentPage * perPage;
        const paginatedProperties = properties.slice(startIndex, endIndex);
    
        res.render('properties', {
          isAuthenticated: res.locals.isAuthenticated,
          properties: paginatedProperties,
          loggedInUserId: req.user._id.toString(),
          currentPage: currentPage,
          totalPages: totalPages,
        });
      } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
  
    
    
    

    app.get('/addProfile', ensureAuthenticated, async (req, res) => {
      try {
        const userId = req.user._id; // Get the logged-in user's ID
    
        const existingProfile = await Profile.findOne({ user: userId });
        if (existingProfile) {
          // User has already added a profile, redirect to a page indicating the limit
          return res.render("ProfileLimitReached");
        }
        else {
          res.render("addProfile",{isAuthenticated: res.locals.isAuthenticated}); 

        }
    
        // User has not yet added a profile, proceed with adding the profile
        // Rest of the code to add the profile...
        // ...
      } catch (error) {
        console.error('Error adding profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.post("/addProfile", ensureAuthenticated, upload.single('image'), async (req, res) => {
      try {
        // Call the addProfile function from the profileController passing the request and response objects
        await profileController.addProfile(req, res);
      } catch (error) {
        console.error('Error adding profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
    
    app.get("/editProfile/:id", ensureAuthenticated, async (req, res) => {
      try {
        const profile = await Profile.findById(req.params.id).populate('user');
    
        if (!profile) {
          return res.status(404).send('Profile not found');
        }
    
        if (profile.user._id.toString() !== req.user._id.toString()) {
          return res.status(403).send('Unauthorized');
        }
    
        res.render("editProfile", {
          profile: profile,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.post("/editProfile/:id", ensureAuthenticated, upload.single('image'), async (req, res) => {
      try {
        const profileId = req.params.id;
        const { name, age, specialization, lookingFor, budget, location, phoneNumber } = req.body;
    
        const profile = await Profile.findById(profileId).populate('user');
    
        if (!profile) {
          return res.status(404).send('Profile not found');
        }
    
        if (profile.user._id.toString() !== req.user._id.toString()) {
          return res.status(403).send('Unauthorized');
        }
    
        // Update the profile fields
        profile.name = name;
        profile.age = age;
        profile.specialization = specialization;
        profile.lookingFor = lookingFor;
        profile.budget = budget;
        profile.location = location;
        profile.phoneNumber = phoneNumber;
        if (req.file) {
          // Update the image path
          profile.image = req.file.path;
        }
        // Save the updated profile
        await profile.save();
    
        // Redirect to the profile page or any other appropriate page
        res.redirect("/Roommates");
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.get('/editProperty/:propertyId', ensureAuthenticated, async (req, res) => {
      try {
        const propertyId = req.params.propertyId;
    
        // Find the property by its ID and populate the user details
        const property = await Property.findById(propertyId).populate('user');
    
        if (!property) {
          // Property not found
          return res.status(404).render('error', { isAuthenticated: res.locals.isAuthenticated, message: 'Property not found' });
        }
    
        // Check if the logged-in user is the owner of the property
        if (property.user._id.toString() !== req.user._id.toString()) {
          // Unauthorized access
          return res.status(403).render('error', { isAuthenticated: res.locals.isAuthenticated, message: 'Unauthorized' });
        }
    
        // Render the edit property page with the property data
        res.render('editProperty', {
          isAuthenticated: res.locals.isAuthenticated,
          property: property,
        googleMapsApiKey: googleMapsApiKey
        });
      } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.post("/editProperty/:id", ensureAuthenticated, upload.single('image'), async (req, res) => {
      try {
        const propertyId = req.params.id;
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
          longitude,
        } = req.body;
    
        const property = await Property.findById(propertyId).populate('user');
    
        if (!property) {
          return res.status(404).send('Property not found');
        }
    
        if (property.user._id.toString() !== req.user._id.toString()) {
          return res.status(403).send('Unauthorized');
        }
    
        // Update the property fields
        property.title = title;
        property.category = category;
        property.area = area;
        property.price = price;
        property.rooms = rooms;
        property.beds = beds;
        property.kitchens = kitchens;
        property.bathrooms = bathrooms;
        property.neighbourhood = neighbourhood;
        property.description = description;
    
        if (req.file) {
          // Update the image path
          property.image = req.file.path;
        }
    
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
    
          // Update the property location
          property.location = {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat],
          };
    
          // Save the updated property
          await property.save();
    
          // Redirect to the properties page or any other appropriate page
          res.redirect('/properties');
        } else {
          // Handle the case when geocoding data is not available
          console.error('Geocoding data not available');
          res.status(500).json({ message: 'Error retrieving property coordinates' });
        }
      } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    

    app.get('/Support', ensureAuthenticated, async(req,res) =>{
      if (!req.user) {
        // Redirect to login or handle unauthorized access
        return res.redirect("/signin.html");
      }
      const currentUser = req.user;
      const { username, email } = currentUser;
    
      res.render("Support", { username, email });

    });
    app.post('/send-email', async (req, res) => {
      const { subject, comment } = req.body;

      // create reusable transporter object using the default SMTP transpor
      let transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          user: req.user.email
        }
      });
    
      // setup email data
      let mailOptions = {
        from: `"Sakanak Support" <${req.user.email}>`,
        to: 'hamzealayan@outlook.com', // list of receivers
        subject: req.body.subject, // Subject line
        text: `Message from: ${req.body.author} (${req.body.email})\n\n${req.body.comment}`, // plain text body
      };
    
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });
    
      res.redirect('/Support'); // redirect back to the support page
    });
    

    app.post('/deleteProfile/:id', ensureAuthenticated, async (req, res) => {
      try {
        const profileId = req.params.id;
        const loggedInUserId = req.user._id;
    
        const profile = await Profile.findOne({ _id: profileId });
    
        if (!profile) {
          return res.status(404).send('Profile not found');
        }
    
        if (profile.user.toString() !== loggedInUserId.toString()) {
          return res.status(403).send('Unauthorized');
        }
    
        await Profile.deleteOne({ _id: profileId });
    
        res.redirect('/Roommates');
      } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.post('/deleteProperty/:id', ensureAuthenticated, async (req, res) => {
      try {
        const propertyId = req.params.id;
        const loggedInUserId = req.user._id;
    
        const property = await Property.findOne({ _id: propertyId });
    
        if (!property) {
          return res.status(404).send('Property not found');
        }
    
        if (property.user.toString() !== loggedInUserId.toString()) {
          return res.status(403).send('Unauthorized');
        }
    
        await Property.deleteOne({ _id: propertyId });
    
        res.redirect('/properties');
      } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
    
    
    
    
    app.post('/logout', authController.logoutUser);



    
  app.listen(3000,function(){
      console.log("server is running on port 3000");
  })



