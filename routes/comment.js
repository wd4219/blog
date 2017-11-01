const router = require('koa-router')();
const Comment = require('../app/controllers/comment');
const User = require('../app/controllers/user');
const tools = require('../tools/index');

router.post('comment/image',async(ctx,next)=>{
  ctx.body = await tools.upload_file(ctx,'article/image/');
});

router.post('comment/:id',User.check_signin,Comment.save_comment)

router.post('delete_comment',User.check_signin,Comment.delete_comment);

router.post('like',User.check_signin,Comment.like_comment);

module.exports = router
