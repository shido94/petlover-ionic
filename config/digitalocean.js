module.exports = {
  development: {
    endpoint: process.env.ENDPOINT,
    accesskey: process.env.ACCESSKEY,
    secretkey: process.env.SECRETKEY,
    bucket: process.env.BUCKET,
    url: process.env.URL
  },
  staging: {
    endpoint: process.env.ENDPOINT,
    accesskey: process.env.ACCESSKEY,
    secretkey: process.env.SECRETKEY,
    bucket: process.env.BUCKET,
    url: process.env.URL
  },
  production: {
    endpoint: process.env.ENDPOINT,
    accesskey: process.env.ACCESSKEY,
    secretkey: process.env.SECRETKEY,
    bucket: process.env.BUCKET,
    url: process.env.URL
  }
};
