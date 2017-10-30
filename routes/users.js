const router = require('koa-router')()
const UserModel = require('../app/controllers/user'); 

router.prefix('/user')

router.post('/signup', UserModel.sign_up);

router.post('/signin',UserModel.sign_in);

router.post('/signout',UserModel.sign_out);

router.get('/:id',UserModel.findUserById);

router.get('/check_username', UserModel.check_username);

router.get('/check_email_phone',UserModel.check_email_phone);



module.exports = router
