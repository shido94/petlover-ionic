const sender = require('../emails/smtp-aquilalogic');

module.exports.sendMail = function(req, template, emailTo, data, callback) {
  // get the host url
  const uri = req ? req.protocol + '://' + req.headers.host : '';
  sender.send({
    template: template,
    message: {
      to: emailTo
    },
    locals: {
      host: uri,
      data: data
    }
  })
  .then((result) => {
    callback(null, result);
  })
  .catch((err) => {
    callback(err, null);
  });
}