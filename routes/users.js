const router = require('koa-router')()
const UserModel = require('../app/controllers/user'); 

router.prefix('/user')

router.post('/signup', UserModel.sign_up);

router.post('/signin',UserModel.sign_in);

router.get('/check_username', UserModel.check_username);

module.exports = router
