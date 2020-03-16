var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '341001854966-1lmojkjgb5kdl8rfvhcihjl4i62lbm23.apps.googleusercontent.com',
      clientSecret: 'JZn4rud-RUsjzdOVyz4616fe',
      callbackURL: 'http://localhost:80/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      // User.findOrCreate(
      //   { userid: profile.id },
      //   { name: profile.displayName, userid: profile.id },
      //   function(err, user) {
      //     return done(err, user);
      //   }
      // );\
      User.findOne({
        'google.sub': profile.id 
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        //No user was found... so create a new user with values from Facebook (all the profile. stuff)
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                provider: 'google',
                //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                google: profile._json
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
