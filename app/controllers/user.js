const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const tools = require('../../tools');


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
  user.password = bcrypt.hashSync(ctx.request.body.password);
  let _user = new UserModel(user);
  let result = await _user.save();
  if (result) {
    ctx.session.user = result;
    ctx.flashMessage.success = '注册成功'
    ctx.redirect('/');
  } else {
    ctx.redirect('signup');
  }
}
// 登录
exports.sign_in = async(ctx, next) => {
  let user = ctx.request.body;
  let _user = await UserModel.findOne({
    email: user.email
  }).exec();
  if (_user) {
    if (bcrypt.compareSync(user.password, _user.password)) {
      ctx.session.user = _user;
      ctx.flashMessage.success = '登录成功';
      ctx.redirect('/');
    } else {
      ctx.flashMessage.danger = '登录失败，密码错误';
      ctx.redirect('signin');
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
  try {
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
  } catch (err) {
    console.log(err);
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
      ctx.flashMessage.error = '旧密码错误';
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