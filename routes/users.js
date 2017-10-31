const router = require('koa-router')()
const UserModel = require('../app/controllers/user'); 
const User = require('../app/models/user');
const multiparty = require('multiparty');
const util = require('util');
const fs = require('fs');
const client = require('../config/oss');
const path = require('path');

router.prefix('/user')

router.post('/signup', UserModel.sign_up);

router.post('/signin',UserModel.sign_in);

router.get('/signout',UserModel.sign_out);

router.get('/',UserModel.findUserById);

router.get('/setting',UserModel.info);

router.get('/check_username', UserModel.check_username);

router.get('/check_email_phone',UserModel.check_email_phone);

router.post('/info_update',UserModel.info_update)

router.post('/password_update',UserModel.password_update)

router.post('/avatar', async(ctx, next) => {
  try{
    if(ctx.session && ctx.session.username){
      let files = await get_file(ctx)
      let filename = files.file[0].originalFilename || path.basename(files.file[0].path);
      let stream = fs.createReadStream(files.file[0].path);
      let result = await client.putStream('avatar/' +
        filename, stream, {
          contentLength: files.file[0].size
        });
      let acl = client.putACL('avatar/' +
        filename, 'public-read');
      await User.findOneAndUpdate(ctx.session._id,{avatar:result.url}).exec();
      ctx.body = {
        code:0,
        message:'保存成功',
        data:{
          url:result.url,
          filename:filename
        }
      }
      ctx.flash.set('图片上传成功');
      ctx.redirect('/user/'+ctx.session._id+'/setting');
    }
    else{
      await ctx.render('error',{message:'你还未登陆，请先登录'});
    }
    
  }catch(err){
    console.log(err);
    ctx.body = {
      code:-1,
      message:'保存失败',
      data:{
        url:''
      }
    }
  }
});

function get_file(ctx) {
  return new Promise((resolve, reject) => {
    var form = new multiparty.Form();
    form.parse(ctx.req, function (err, fields, files) {
      if(err){
        reject(err);
      }
      else{
        resolve(files);
      }
    });
  });
}

module.exports = router
