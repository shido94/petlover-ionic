const multer = require('multer');
const multerS3 = require('multer-s3');
const utils = require('../utils/utils');
const random = require('../utils/random');
const s3 = require('./s3');
const storageConfig = require('../config/digitalocean')[process.env.NODE_ENV];const path = require('path')
const UPLOAD_PATH = path.resolve(__dirname, 'public/files');
/** Storage Engine */
const storageEngine = multer.diskStorage({
  destination: UPLOAD_PATH,
  filename: function(req, file, fn){
    fn(null,  new Date().getTime().toString()+'-'+file.fieldname+path.extname(file.originalname));
  }
});



const storage = multerS3({
  s3: s3,
  bucket: storageConfig.bucket,
  acl: 'public-read',
  metadata: function(req, file, cb) {
    cb(null, {name: file.fieldname});
  },
  key: function(req, file, cb) {
    let f = new Date().getTime() + random.randomToken().replace('.', '');
    if (req.query.path) f = utils.trimPath(req.query.path) + '/' + f;
    console.log(f)
    cb(null, f);
  }
});

const upload = module.exports = multer({
    storage: storageEngine,
    dest: UPLOAD_PATH,
    limits: {fileSize: 1000000, files: 5}
  });