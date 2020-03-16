module.exports = {
    development: {
      port: process.env.PORT || 3000
    },
    staging: {
      port: process.env.PORT || 3000,
      mail: {
        host: 'smtp.googlemail.com',
        port: 465,
        secure: true,
        user: 'do-not-reply@dioworksgroup.com',
        password: 'botfullyyours',
        from: 'do-not-reply@dioworksgroup.com',
        preview: false,
        send: true
      },
    },
    production: {
      port: process.env.PORT || 3000
    }
  };
  