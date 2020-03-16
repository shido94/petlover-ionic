// const passportSignup = require('../auth/local-signup');
// const passportLogin = require('../auth/local-login');
const passport = require('passport');
const userModule = require('../users/userModule');
const validator = require('validator');
const { ErrorTypes, IncorrectCredentialsError} = require('../errrors/errors');
const { validations, jwtSecret } = require('../config/index');
const User = require('../models/user');
const Admin = require('../models/admin');
const Request = require('../models/request');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email');
var NodeGeocoder = require('node-geocoder');
var fs = require('fs');
var mongoose = require('mongoose');
const { wlogger } = require('../config/index');
const Image = require('../models/im');





// POST /auth/signup
exports.postSignup = async function(req, res, next) {
    wlogger.debug('postSignup: ', req.body);
    const validationResult = validateSignupForm(req.body);
    wlogger.debug('validationResult: ', validationResult);
    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }
    const ifUserExist = await User.getUserByEmail(req.body.email);

    try {
        if (ifUserExist) {
            wlogger.debug('ifUserExist: ', `User exist with email ${req.body.email}`);
            return res.status(409).json({
                success: false,
                message: 'Check the form for errors.',
                errors: {
                    email: 'This email is already taken.'
                }
            });
        }
        const user = await User.addUser(req.body);
        if (user) {
            wlogger.info(`User registered successfully with email: ${req.body.email}`);
            delete req.body.password;
            return res.status(200).json({
                success: true,
                message: 'Sign up success.',
                user: user
            });
        }
    } catch(error) {
        wlogger.error('Error in postSignup: ', error);
        return res.status(400).json({
            success: false,
            message: 'Could not process the form.'
        });
    }
};





// POST /auth/login
exports.postLogin = async function(req, res, next) {
    const validationResult = validateLoginForm(req.body);
    wlogger.debug('validationResult: ', validationResult);
    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }
    try {
    const user = await User.getUserByEmail(req.body.email);

        if(!user) {
            wlogger.debug(`Incorrect email or email not found:  ${req.body.email}`);
            const err = new IncorrectCredentialsError('Incorrect email');
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if(user.provider) {
            wlogger.debug(`login request by social user email:  ${req.body.email}`);
            return res.status(400).json({
                success: false,
                message: `This email ${user.email} is registered with social login, try that way to login`
            });
        }    

        const match = await User.comparePassword(req.body.password, user.password);
        if(!match) {
            wlogger.debug(`Incorrect password for email ${req.body.email}`);
            const err = new IncorrectCredentialsError('Incorrect password');
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        req.session.user = JSON.stringify(user);
        wlogger.info(`User login successful with email: ${req.body.email}`);
        return res.status(200).json({
            success: true,
            message: 'Login success.',
            user: user
        });
    } catch (error) {
        wlogger.error('Error in postLogin: ', error);
        return res.status(400).json({
            success: false,
            message: 'Could not process the login.'
        });
    }
};





// POST /auth/reset
exports.postReset = async function(req, res, next) {
    const user = req.body;
    user.email = req.user.email;
    wlogger.debug(`password reset request for, ${user.email}`);
    //Using validator module to valid email pattern
    const valid = validator.isEmail(user.email);
    wlogger.debug('is email valid: ', valid);
    if (valid) {
      try {
        const result = await userModule.resetPassword (user);
        if (result.name === ErrorTypes.IncorrectCredentials) {
            wlogger.debug(`incorrect email or password, ${user.email}`);

            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        wlogger.info(`reset password successful, ${user.email}`);
        return res.status(200).json({
          success : true,
          data : result,
          message : 'password changed Successfully'
        });
      }
      catch (err) {
        wlogger.error(`error in reseting password, ${err}`);
        throw err;
      }
    }
};





// POST /auth/forgot_pass
exports.postForgot_pass = async function (req, res, next) {
    let email = req.body.email;
    if (email) email = email.trim();
    const uri = req.protocol + '://' + req.headers.host;
    wlogger.debug('forgotpassword request by=> ', email);

    try {
        const user = await userModule.getUserByEmail(email);
        if (!user) {
            wlogger.debug(`Incorrect email or email not found:  ${email}`);
            const err = new IncorrectCredentialsError('Incorrect email');
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        const payload = {
            sub: user._id
        };
        // create a token string
        const token = jwt.sign(payload, jwtSecret);
        Email.sendMail(req, 'forgot-password', user.email, { link: uri + '/auth/new-password/' + encodeURIComponent('##' + token), name: user.name }, (err, mailResult) => {
            if(err) {
                wlogger.debug(`error sending email, ${err}`);
                return res.json ({
                    message: 'unable to send email',
                    success: false,
                    error: err
                });
            }
            wlogger.info('forgotpassword/email URL=> ',uri + '/auth/new-password/' + encodeURIComponent('##' + token));
            return res.json ({
                success: true,
                message: 'Reset password email link has been sent to : ' + email,
                result: mailResult
            });
        });            
    }
    catch (err) {
        throw err;
    }
};




// POST /auth/change_forgot_pass
exports.change_forgot_pass = async function (req, res, next) {
    const url = decodeURIComponent(req.body.link);
    const arr = url.split('##');
    const token = arr[1];
    if(req.body.conf_password !== req.body.new_password) {
        return res.json({
            success: false,
            message: 'password not matching'
        });
    }
    try {
        const result = await User.changePasswordByToken(token, req.body.new_password);
            wlogger.info(`/changeForgot_pass: password updated`);
            return res.status(400).json({
                success: true,
                message: `password changed`,
                result: result
            });
    }
    catch(err) {
        throw err;
    }
}





//GET trucks/categories
exports.getTruckCategories = async function(req, res, next) {
    wlogger.debug(`get Truck categories request`);
    try {
        const truckCategories = await Admin.getTruckCategories();
        wlogger.info(`get Truck categories success`);
        res.json({
            truckCategories: truckCategories,
            success: true
        });
    }
    catch(err) {
        wlogger.err(`get Truck categories success: ${err}`);
        throw err;
    }
}





// POST /user/request
exports.userRequest = async function(req, res, next) {
    try {
        const result = await Request.addRequest(req.body);
        if (result) {
            wlogger.info(`request saved successfully`);
            return res.status(200).json({
                success: true,
                message: 'request saved',
                result: result
            });
        }
    } catch(error) {
        wlogger.error('Error in saving request: ', error);
        return res.status(400).json({
            success: false,
            message: 'Could not process the form.'
        });
    }
}




// POST /user/trip-request/images
exports.imageUpload = async function(req, res, next) {
  const images = req.files.map((file) => {
    return {
      filename: file.filename,
      originalname: file.originalname,
      path: file.path
    }
  });
  Image.insertMany(images, (err, result) => {
    if (err) {
        wlogger.error('Error in uploading images: ', error);
        return res.sendStatus(404);
    }
    wlogger.info('image uploaded');
    res.json(result)
  });
}



exports.getUser = async function(req, res, next) {
    wlogger.debug(`get user request`);
    if(req.user) {
        wlogger.info(`get user success`);
        return res.status(200).json({
            success: true,
            message: 'get user success',
            result: req.user
        });
    } else {
        wlogger.error(`get user request failed`);
        return res.json({
            success: false,
            message: 'get user failed'
        })
    }
    
}



//user/address/:name getGoogleAddress
// exports.getGoogleAddress2 = async function(req, res, next) {
//     var options = {
//         provider: 'google',
//         // Optional depending on the providers
//         httpAdapter: 'https', // Default
//         apiKey: 'AIzaSyApGYaAqxANYBW8YLNx7dD0_QC4aRQWvZg', // for Mapquest, OpenCage, Google Premier
//         formatter: null         // 'gpx', 'string', ...
//       };
       
//       var geocoder = NodeGeocoder(options);
       
//       // Using callback
//       geocoder.geocode('j-1/33 budh vihar', function(err, res) {
//           if(err){
//               return;
//           }
//       });
// }

// ///user/address/:name getGoogleAddress
// exports.getGoogleAddress3 = async function(req, res, next) {
//     var key = 'AIzaSyDoAaOSlmgnGd36Onqz0Zv1Q6zl8kzmorU';
//     var location = encodeURIComponent(req.params.name);
//     var radius = 16000;
//     var sensor = false;
//     var types = "restaurant";
//     var keyword = "fast";
  
//     var https = require('https');
//     var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyApGYaAqxANYBW8YLNx7dD0_QC4aRQWvZg' 
//     https.get(url, function(response) {
//       var body ='';
//       response.on('data', function(chunk) {
//         body += chunk;
//       });
  
//       response.on('end', function() {
//         var places = JSON.parse(body);
//         var locations = places.results;
//         var randLoc = locations[Math.floor(Math.random() * locations.length)];
  
//         res.json(randLoc);
//       });
//     }).on('error', function(e) {
//       console.log("Got error: " + e.message);
//     });
// }






/**
 * Validate the sign up form
 *
 * @param   {object} body The HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignupForm(body) {
    const errors = {};
    let isFormValid = true;
    let message = '';
    if (!body || typeof body.email !== 'string' ||
      !(validations.email.regex.value).test(body.email.trim())) {
        isFormValid = false;
        errors.email = validations.email.regex.message;
    }

    if (!body || typeof body.password !== 'string' ||
        body.password.length < validations.password.minLength.value) {

        isFormValid = false;
        errors.password = validations.password.minLength.message;
    }

    if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
        isFormValid = false;
        errors.name = 'Please provide your name.';
    }

    if (!isFormValid) {
        message = 'Check the form for errors.';
    }

    return {
        success: isFormValid,
        message,
        errors
    };
}

/**
 * Validate the login form
 *
 * @param   {object} body The HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(body) {
    const errors = {};
    let isFormValid = true;
    let message = '';

    if (!body || typeof body.email !== 'string' ||
      !(validations.email.regex.value).test(body.email.trim())) {
        isFormValid = false;
        errors.email = validations.email.regex.message;
    }

    if (!body || !body || typeof body.password !== 'string' ||
        body.password.length < validations.password.minLength.value) {
        isFormValid = false;
        errors.password = validations.password.minLength.message;
    }

    if (!isFormValid) {
        message = 'Check the form for errors.';
    }

    return {
        success: isFormValid,
        message,
        errors
    };
}


