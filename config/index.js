const validations = require('../validation/model-validations');
const app = require('./app')[process.env.NODE_ENV];
const logger = require('../config/winston');
module.exports = {

    // DB
    dbUri: 'mongodb://localhost:27017/social',

    logging: {
        dbUri: 'mongodb://localhost:27017/social'
    },

    // jsonwebtoken secret
    jwtSecret: '!!secret phrase!!',

    // Model validations
    validations, // :validations,

    // Env variables
    port: app.port,

    wlogger: logger
};