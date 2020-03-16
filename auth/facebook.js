var passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

passport.use(
  new FacebookStrategy(
    {
      clientID: '182444519686710',
      clientSecret: 'd181698c3f01f399541e40353405d0fc',
      callbackURL: 'http://localhost:80/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile)
      // User.findOrCreate(
      //   { userid: profile.id },
      //   { name: profile.displayName, userid: profile.id },
      //   function(err, user) {
      //     return done(err, user);
      //   }
      // );\
      User.findOne({
        'facebook.sub': profile.id 
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        //No user was found... so create a new user with values from Facebook (all the profile. stuff)
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                provider: 'facebook',
                //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                facebook: profile._json
            });
            user.save(function(err) {
                if (err) console.log(err);
                return done(err, user);
            });
        } else {
            //found user. Return
            return done(err, user);
            
        }
    });
    }
  )
);

module.exports = passport;
