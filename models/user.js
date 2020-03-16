const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { validations, jwtSecret } = require('../config/index');

const {
  // ErrorTypes,
  // NotAuthorizedError,
  IncorrectCredentialsError } = require('../errrors/errors');

var UserSchema = new mongoose.Schema({
  role: {
    type: String,
    default: 'customer'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  truck_category: {
    type: String
  },
  is_active: {
    type: Boolean,
    required: true
  },
  is_emailverified: {
    type: Boolean,
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false,
    required: true
  },
  created_on: {
    type: Date,
    required: true
  },
  updated_at: { type: Date, default: Date.now },
  mobile: {
    type: String,
    default: ''
  },
  profile_pic: {
    type: String,
    default: ''
  },
  last_active: {
    type: Date,
    default: new Date()
  },
  provider:  String,
  facebook: Object,
  google: Object,
  available_truck_categories: {
    type: Array,
    default: ['light_truck', 'heavy_truck']
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.addUser = async (newUser) => {
  const hashedPassword = await bcrypt.hash(newUser.password.trim(), 10);
  try {

    newUser.password = hashedPassword;
    newUser.email = newUser.email.trim();

    const user = new User(newUser);
    return user.save();


  } catch(error) {

    return error;

  }
};

module.exports.getUserByEmail = async function (email, callback) {
  const user = await User.findOne({'email': email});
  return user;
};

module.exports.comparePassword = async function (password, dbPassword) {
  const isMatched = await bcrypt.compare(password.trim(), dbPassword);
  return isMatched;
};

module.exports.changePasswordByToken = async function (token, password, callback) {
  const decoded = await jwt.verify(token, jwtSecret);
  const hashedPassword = await bcrypt.hash(password.trim(), 10);
  const result = await User.update({'_id': decoded.sub}, {'password': hashedPassword });
  return result;
};


