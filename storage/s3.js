const aws = require('aws-sdk');
const storageConfig = require('../config/digitalocean')[process.env.NODE_ENV];
const wlogger = require('../config/winston');

const s3 = new aws.S3({
  endpoint: new aws.Endpoint(storageConfig.endpoint),
  accessKeyId: storageConfig.accesskey,
  secretAccessKey: storageConfig.secretkey,
  signatureVersion: 'v2'
});

module.exports = s3;

module.exports.list = function(params, callback) {
  s3.listObjectsV2({ Bucket: storageConfig.bucket, Prefix: params.Prefix }, (err, data) => {
    if (err) wlogger.error('delete storage', err);
    callback(err, data);
  });
};

module.exports.createDirectory = function(path, callback) {
  s3.upload({ Bucket: storageConfig.bucket, Key: path + '/' }, (err) => {
    if (err) wlogger.error('createDirectory', err);
    callback(err);
  });
};

function emptyDirectory(dir, callback) {
  var params = {
    Bucket: storageConfig.bucket,
    Prefix: dir + '/'
  };

  s3.listObjects(params, function(err, data) {
    if (err) return callback(err);
    const root = data;
    if (data.Contents.length === 0) callback();

    params = { Bucket: storageConfig.bucket };
    params.Delete = {Objects: []};

    data.Contents.forEach(function(content) {
      params.Delete.Objects.push({Key: content.Key});
    });

    s3.deleteObjects(params, function(err, data) {
      if (err) return callback(err);
      if (root.Contents.IsTruncated) emptyDirectory(dir);
      else callback();
    });
  });
}

function copyDirectory(from, to, callback) {
  var params = {
    Bucket: storageConfig.bucket,
    Prefix: from + '/'
  };

  s3.listObjects(params, function(err, data) {
    if (err) return callback(err);
    if (data.Contents.length === 0) callback();
    data.Contents.forEach((content) => {
      var copyParams = {
        Bucket: storageConfig.bucket,
        CopySource: storageConfig.bucket + '/' + content.Key,
        Key: content.Key.replace(from, to),
        ACL: 'public-read'
      };

      s3.copyObject(copyParams, function(err, data) {
        if (err) return callback(err);
      });
    });
    return callback();
  });
};

module.exports.renameDirectory = function(from, to) {
  copyDirectory(from, to, (err) => {
    if (err) {
      wlogger.error('renameDirectory', err.stack);
    } else {
      emptyDirectory(from, (err) => {
        if (err) wlogger.error('renameDirectory => deleteDirectory', err.stack);
      });
    }
  });
};

module.exports.deleteDirectory = function(dir) {
  emptyDirectory(dir, (err) => {
    if (err) wlogger.error('deleteDirectory', err.stack);
  });
};

module.exports.getFile = function(key, callback) {
  var params = {
    Bucket: storageConfig.bucket,
    Key: key
  };

  s3.headObject(params, function(err, data) {
    if (err) return callback(err, null); // an error occurred
    else  return callback(null, data);           // successful response
  });
};

module.exports.deleteFile = async function (file) {
  try {
    const found = await s3.headObject({ Bucket: storageConfig.bucket, Key: file }).promise()
    wlogger.debug('File Found in S3')

    if (found) {
      await s3.deleteObject({ Bucket: storageConfig.bucket, Key: file }).promise()
      wlogger.debug('file deleted Successfully');
    }
  } catch {
    wlogger.debug('Image not found in aws');
  }

  // wlogger.info('deleteFile + ', file);
  // s3.deleteObject({ Bucket: storageConfig.bucket, Key: file }, (err, data) => {
  //   if (err) wlogger.error('delete storage', err.stack);
  //   else console.log(data); 
  // });
};
