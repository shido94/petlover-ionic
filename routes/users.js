var express = require('express');
var router = express.Router();
const passport = require('passport');
require('../auth/passport')(passport);
const ensureAuthenticated = (req, res, next) => {
    if(!req.session.user) {
      res.status(401).send({
        status: false,
        message: "Not authorized"
      });
    }
    else return next();
}

/* GET users listing. */
router.get('/', ensureAuthenticated, function(req, res, next) {

  const user = JSON.parse(req.session.user);

  return res.status(200).json({
    success: true,
    user: user
  });
});


module.exports = router;
