var passport = require('passport', (TwitterStrategy = require('passport-twitter')
  .Strategy));
var User = require('../models/User.js');

passport.serializeUser(function(user, fn) {
  fn(null, user);
});

passport.deserializeUser(function(id, fn) {
  User.findOne({ _id: id.doc._id }, function(err, user) {
    fn(err, user);
  });
});

passport.use(
  new TwitterStrategy(
    {
      consumerKey: 'GOkWE6qvcZuzpjpXVoWzkt89L',
      consumerSecret: 'mw10Rt8B9M52BKzYy43RljIG3PHK3ajKD4lFhHFuSzx4UfVqPN',
      callbackURL: 'http://localhost:3000/auth/twitter/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        { name: profile.displayName },
        { name: profile.displayName, userid: profile.id },
        function(err, user) {
          if (err) {
            console.log(err);
            return done(err);
          }
          done(null, user);
        }
      );
    }
  )
);
module.exports = passport;
