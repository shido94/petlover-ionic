var passport = require('passport'),
  GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: '',
      clientSecret: '',
      callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        { userid: profile.id },
        { name: profile.displayName, userid: profile.id },
        function(err, user) {
          return done(err, user);
        }
      );
    }
  )
);

module.exports = passport;
