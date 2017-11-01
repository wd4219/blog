const router = require('koa-router')()
const User = require('../app/controllers/user'); 
const UserModel = require('../app/models/user');
const multiparty = require('multiparty');
const util = require('util');
const fs = require('fs');
const client = require('../config/oss');
const path = require('path');

router.post('/signup', User.sign_up);

router.post('/signin',User.sign_in);

router.get('/signout',User.sign_out);

router.get('/',User.findUserById);

router.get('/setting',User.check_signin,User.info);

router.get('/check_username', User.check_username);

router.get('/check_email_phone',User.check_email_phone);

router.post('/info_update',User.check_signin,User.info_update)

router.post('/password_update',User.check_signin,User.password_update)

router.get('/signin',async(ctx,next)=>{
  await ctx.render('signin');
});
router.get('/signup',async(ctx,next)=>{
  await ctx.render('signup');
});

router.post('/avatar', User.check_signin,async(ctx,next)=>{
  ctx.body = await tools.upload_file(ctx,'avatar/');
});

module.exports = router
