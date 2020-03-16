var passport = require('passport'),
  GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: '829b2f21bf27430d6a0d',
      clientSecret: '2e53d5e6a24c355534029b182ad5ee39e160811c',
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
