module.exports = {
  development: {
    endpoint: process.env.ENDPOINT,
    accesskey: process.env.ACCESSKEY,
    secretkey: process.env.SECRETKEY,
    bucket: process.env.BUCKET,
    url: process.env.URL
  },
  staging: {
    endpoint: process.env.ENDPOINT || 'http://sfo2.digitaloceanspaces.com/',
    accesskey: process.env.ACCESSKEY || 'AWGG4AQNYR2XLN343W3G',
    secretkey: process.env.SECRETKEY || '5s3nx7m4PY7xdWZFx6OduQKOYszRbSz0K/S3Pm2/pG0',
    bucket: process.env.BUCKET || 'infoxen-test',
    url: process.env.URL || 'https://infoxen-test.sfo2.digitaloceanspaces.com/'
  },
  production: {
    endpoint: process.env.ENDPOINT,
    accesskey: process.env.ACCESSKEY,
    secretkey: process.env.SECRETKEY,
    bucket: process.env.BUCKET,
    url: process.env.URL
  }
};
