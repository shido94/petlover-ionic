var express = require('express');
var router = express.Router();
var passportFacebook = require('../auth/facebook');
var passportGoogle = require('../auth/google');
const authController = require('../controllers/authController');
const passport = require('passport');
require('../auth/passport')(passport);
const upload = require('../storage/asset')

const ensureAuthenticated = passport.authenticate('jwt', { session: false });

router.get('/signup', (req,res) => {
  res.render('register');
});

// POST /auth/signup
router.post('/signup', (req,res) => {
    authController.postSignup(req,res);
});

router.get('/login', (req, res) => {
  res.render('login');
});

// POST /auth/login
router.post('/login', (req,res) => {
  authController.postLogin(req,res);
});

//Post /auth/forgot_pass
router.post('/forgot_pass', (req, res, next) => {
  authController.postForgot_pass(req,res);
  
});

//Post /auth/change_forgot_pass
router.post('/change_forgot_pass', (req, res, next) => {
  authController.change_forgot_pass(req,res);
  
});

/* RESET PASSWORD */
router.post('/resetPassword', ensureAuthenticated, (req,res) => {
  authController.postReset(req,res);
})

/* LOGIN ROUTER */
router.get('/login', (req, res, next) => {
  res.render('login', { title: 'or SignIn with:' });
});

/* LOGOUT ROUTER */
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

/* FACEBOOK ROUTER */
router.get('/facebook', passportFacebook.authenticate('facebook',{ scope: ['read_stream', 'publish_actions'] }));

router.get(
  '/facebook/callback',
  passportFacebook.authenticate('facebook', { successRedirect: '/',failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);


/* GOOGLE ROUTER */
router.get(
  '/google',
  passportGoogle.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'],
  },
  )
);

router.get(
  '/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login',session: false }),
  function(req, res) {
     res.redirect('/');
  }
);




// POST /user/address/
router.get('/user/address/:name', (req, res) => {
  authController.getGoogleAddress3(req ,res);
});


// Post /user/trip-request/images
router.post('/user/trip-request/images', upload.array('image', 5), (req, res) => {
  authController.imageUpload(req, res)
});

//GET /v1/trucks/categories
router.get('/trucks/categories', (req, res) => {
  authController.getTruckCategories(req, res);
});

// POST /users/request
router.post('/user/request', (req, res) => {
  authController.userRequest(req, res);
});

// GET /user/:id
router.get('/getUser', ensureAuthenticated, (req, res) => {
  authController.getUser(req, res);
})

//PUT /updateUser
router.put('/updateUser', (req, res) => {

})
module.exports = router;

