// const LocalStrategy = require("passport-local").Strategy


// passport.use(new LocalStrategy(
//     {
//       usernameField: 'email', // Assuming email is used for authentication
//       passwordField: 'password',
//     },
//     function(email, password, done) {
//       // Implement your logic to find and validate the user
//       User.findOne({ email }).exec()
//         .then((user) => {
//           if (!user) {
//             return done(null, false);
//           }
  
//           return bcrypt.compare(password, user.password)
//             .then((isMatch) => {
//               if (!isMatch) {
//                 return done(null, false);
//               }
  
//               return done(null, user);
//             });
//         })
//         .catch((err) => done(err));
//     }
//   ));
//   // Serialization
//   passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });
  
//   // Deserialization
//   passport.deserializeUser(function(id, done) {
//     User.findById(id).exec()
//       .then((user) => {
//         done(null, user);
//       })
//       .catch((err) => {
//         done(err);
//       });
//   });