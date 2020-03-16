const nodemailer = require('nodemailer');
const Email = require('email-templates');
const wlogger = require('../config/index');
const mailConfig = require('../config/app')[process.env.NODE_ENV].mail;

const validEnvs = ['webapp', 'production'];

let transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure, // use TLS
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password
  },
  tls: {
    rejectUnauthorized: false
  }
});

if (isValidEnv()) {
  // verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      wlogger.error('verify smtp server', error);
    } else {
      console.log('Server smtp is ready to take our messages');
    }
  });
}

const email = new Email({
  message: {
    from: mailConfig.from
  },
  // uncomment below to send emails in development/test env:
  send: mailConfig.send,
  transport: transporter,
  preview: mailConfig.preview
});

module.exports = email;

function isValidEnv() {
  return validEnvs.includes(process.env.NODE_ENV);
}
