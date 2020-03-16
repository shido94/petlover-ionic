const crypto = require('crypto');

module.exports.randomPassword = function() {
  return Math.random().toString(36).slice(-8);
};

module.exports.randomToken = function() {
  return Math.random().toString(36).slice(-20);
};

module.exports.randomKey = function() {
  return crypto.randomBytes(16).toString('hex');
};
