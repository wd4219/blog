const OSS = require('ali-oss').Wrapper;
const config = require('./index');

const client = new OSS({
  region: 'oss-cn-beijing',
  accessKeyId: config.accessKeyId,
  accessKeySecret: config.accessKeySecret,
  bucket: config.bucket
});

module.exports = client;