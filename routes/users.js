const router = require('koa-router')()
const User = require('../app/controllers/user'); 
const UserModel = require('../app/models/user');

router.post('/signup', User.sign_up);

router.post('/signin',User.sign_in);

router.get('/signout',User.sign_out);

router.get('/email_verify',User.email_verify);

router.get('/verify',User.verify)

router.get('/',User.findUserById);

router.get('/setting',User.check_signin,User.info);

router.get('/check_username', User.check_username);

router.get('/check_email',User.check_email);

router.post('/info_update',User.check_signin,User.info_update)

router.post('/password_update',User.check_signin,User.password_update)

router.get('/signin',async(ctx,next)=>{
  await ctx.render('signin');
});
router.get('/signup',async(ctx,next)=>{
  await ctx.render('signup');
});

router.post('/avatar', User.check_signin,User.upload_avatar);

module.exports = router
