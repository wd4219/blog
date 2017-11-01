const router = require('koa-router')();
const users = require('./users');
const admin = require('./admin');
const article = require('./article');
const comment = require('./comment');


router.use('/user',users.routes(), users.allowedMethods());

router.use('/admin',admin.routes(), admin.allowedMethods());

router.use('/',article.routes(), article.allowedMethods());

router.use('/',comment.routes(), comment.allowedMethods());

module.exports = router