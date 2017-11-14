const mongoose = require('mongoose');
const UserModel = require('../models/user');
const config = require('../../config');
const tools = require('../../tools');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

let res_model = (code, message, data) => {
  return {
    code: code,
    message: message,
    data: data ? data : {}
  }
};
//注册用户
exports.sign_up = async(ctx, next) => {
  let user = ctx.request.body;
  user.password = tools.sha1(ctx.request.body.password,config.secret);
  let _user = new UserModel(user);
  let result = await _user.save();
  if (result) {
    ctx.flashMessage.success = '注册成功';
    ctx.redirect('email_verify?id='+result._id);
  } else {
    ctx.redirect('signup');
  }
}
exports.email_verify = async (ctx,next)=>{
  const token = jwt.sign({
    data:tools.enc_ase192(ctx.request.query.id,config.secret) 
  }, config.secret, { expiresIn: 5 * 60 });
  let _user = await UserModel.findById(ctx.request.query.id).exec();
  let transporter = nodemailer.createTransport({
    host: 'smtp.mxhichina.com',
    secure:true,
    port:465,
    auth: {
      user: 'ezblog@ezblog.com.cn',
      pass: 'honey77314..'
    }
  });
  let mailOptions = {
    from: 'ezblog@ezblog.com.cn',
    to: _user.email,
    subject: 'ezblog邮箱验证',
    html:''
  };
  try{
    await transporter.sendMail(mailOptions)
    ctx.flashMessage.success = '邮件已发送，有效期5分钟！';
    await ctx.render('email')
  }catch(err){
    ctx.flashMessage.danger = '邮件发送失败，请刷新页面重试！';
    await ctx.render('email')
  }
  
}
exports.verify = async (ctx,next)=>{
  try {
    let decoded = jwt.verify(ctx.request.query.token, config.secret);
    let _user = await UserModel.findByIdAndUpdate(tools.dec_ase192(decoded.data,config.secret),{active:true}).exec();
    if (_user) {
      ctx.flashMessage.success = '账号激活成功，请登录！';
      ctx.redirect('signin')
    } else {
      ctx.flashMessage.danger = '激活失败，用户不存在';
      ctx.redirect('signup');
    }
  }catch(err) {
    ctx.flashMessage.danger = '链接已过期，已发送新的激活邮件，请查收！';
    
  }
}

// 登录
exports.sign_in = async(ctx, next) => {
  let user = ctx.request.body;
  let _user = await UserModel.findOne({
    email: user.email
  }).exec();
  if (_user) {
    if(_user.active){
      if (_user.password == tools.sha1(user.password,config.secret)) {
        ctx.session.user = _user;
        ctx.flashMessage.success = '登录成功';
        ctx.redirect('/');
      } else {
        ctx.flashMessage.danger = '登录失败，密码错误';
        ctx.redirect('signin');
      }
    }
    else{
      ctx.flashMessage.danger = '您还没有验证邮箱无法登录';
      ctx.redirect('email');
    }
  } else {
    ctx.flashMessage.danger = '登录失败，用户不存在';
    ctx.redirect('signin');
  }
}

exports.check_username = async(ctx, next) => {
  let username = ctx.request.query.username;
  try {
    let _user = await UserModel.findOne({
      username: username
    }).exec();
    if (_user) {
      ctx.body = res_model(-1, '昵称已存在,请重新输入');
    } else {
      ctx.body = res_model(0, '昵称可以使用');
    }
  } catch (err) {
    ctx.body = res_model(-2, '出错了', err);
  }
}

exports.check_email = async(ctx, next) => {
  let email = ctx.request.query.email;
  try {
    let _user = await UserModel.findOne({
      email: email
    }).exec();
    if (_user) {
      ctx.body = res_model(-1, '手机或邮箱已存在,请重新输入');
    } else {
      ctx.body = res_model(0, '手机或邮箱可以使用');
    }
  } catch (err) {
    ctx.body = res_model(-2, '出错了', err);
  }
}

exports.check_signin = async(ctx, next) => {
  if (ctx.session && ctx.session.user) {
    await next();
  } else {
    ctx.flashMessage.danger = '请先登录';
    await ctx.render('signin');
  }
}
exports.sign_out = async(ctx, next) => {
  if (ctx.session && ctx.session.user) {
    ctx.session.user = null;
    ctx.flashMessage.success = '退出成功';
  }
  ctx.redirect('/');
}

exports.admin = async(ctx, next) => {
  if (ctx.session && ctx.session.user && ctx.session.user.rule == 10) {
    await next();
  } else {
    ctx.response.status = 404;
    await ctx.render('404');
  }
}

exports.info = async(ctx, next) => {
  try {
    let user = await UserModel.findById(ctx.session.user._id, {
      __v: 0,
      password: 0,
      rule: 0
    }).exec();
    if (user) {
      let data = {
        user
      };
      await ctx.render('user', user);
    } else {
      ctx.flashMessage.danger = '用户不存在'
      ctx.redirect('back');
    }
  } catch (err) {
    console.log(err);
  }
}

exports.findUserById = async(ctx, next) => {
    if(ctx.query.id.length !== 24){
      ctx.flashMessage.danger = '用户不存在'
      ctx.redirect('back');
    }
    let user_info = await UserModel.findById(ctx.query.id, {
      __v: 0,
      password: 0,
      email: 0,
      rule: 0
    }).exec();
    if (!user_info) {
      ctx.flashMessage.danger = '用户不存在'
      ctx.redirect('back');
    } else {
      let data = {
        user_info: user_info
      };
      await ctx.render('user', data);
    }
}

exports.info_update = async(ctx, next) => {
  try {
    let info = ctx.request.body;
    await UserModel.findByIdAndUpdate(ctx.session.user._id, {
      username: info.username,
      motto: info.motto
    }).exec();
    ctx.flashMessage.success = '用户信息修改成功';
    ctx.redirect('/user/setting?' + ctx.session.user._id);
  } catch (err) {
    console.log(err);
  }
}

exports.password_update = async(ctx, next) => {
  try {
    let password = ctx.request.body;
    let _user = await UserModel.findById(ctx.session.user._id).exec();
    if (bcrypt.compareSync(password.old, _user.password)) {
      await UserModel.findByIdAndUpdate(ctx.session.user._id, {
        password: bcrypt.hashSync(password.new)
      }).exec();
      ctx.flashMessage.success = '密码修改成功'
      ctx.redirect('/user/setting?' + ctx.session.user._id);
    } else {
      ctx.flashMessage.danger = '旧密码错误';
      ctx.redirect('back');
    }
  } catch (err) {
    console.log(err);
  }
}

exports.upload_avatar = async(ctx,next)=>{
  let result = await tools.upload_file(ctx,'avatar/');
  let user = await UserModel.findByIdAndUpdate(ctx.session.user._id,{avatar:result.data.url}).exec();
  ctx.body = result;
}