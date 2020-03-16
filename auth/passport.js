const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const { jwtSecret } = require('../config/index');

module.exports = function(passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('jwt');
  opts.secretOrKey = jwtSecret;
  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    User.findById(jwtPayload.sub, (err, user) => {
      if (err) {
        return done(err, false);
      }

      if (user) {
        if(user.is_active === false) {
          return done(null, false);
        } else {
        return done(null, user);
        }
      } else {
        return done(null, false);
      }
    });
  }));
};
