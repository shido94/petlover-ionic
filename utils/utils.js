const path = require('path');

module.exports.basePath = function(d) {
  return path.parse(d).base;
};

module.exports.dirPath = function(d) {
  return path.parse(d).dir;
};

module.exports.trimPath = function(path) {
  if (path) return path.replace(/^\/+|\/+$/g, '');
  return '';
};
