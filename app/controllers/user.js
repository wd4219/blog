const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
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
  try {
    let _user = new UserModel(user);
    let result = await _user.save();
    if (result) {
      ctx.session.user = result;
      ctx.redirect('/');
    } else {
      ctx.redirect('signup');
    }
  } catch (err) {
    console.log(err);
  }
}
// 登录
exports.sign_in = async(ctx, next) => {
  let user = ctx.request.body;
  try {
    let _user = await UserModel.findOne({
      email: user.email
    }).exec();
    if(_user){
      if (bcrypt.compareSync(user.password, _user.password)) {
        ctx.session.user = _user;
        ctx.redirect('/');
      } else {
        ctx.redirect('signin');
      }
    }
    else{
      ctx.redirect('signin');
    }
  } catch (err) {
    console.log(err);
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
    await ctx.render('signin');
  }
}
exports.sign_out = async(ctx, next) => {
  if (ctx.session && ctx.session.user) {
    ctx.session.user = null;
    ctx.flashMessage.notice = '退出成功';
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
    let data = {user};
    await ctx.render('user', user);
  } catch (err) {
    ctx.err = err;
    await ctx.render('error', {
      message: '用户不存在'
    });
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
      await ctx.render('error', {
        message: '用户不存在'
      });
    } else {
      let data = {};
      if (ctx.session && ctx.session.user) {
        data = {
          user: ctx.session.user,
          user_info: user_info,
        };
      } else {
        data = {
          user_info: user_info
        }
      }
      console.log(data);
      await ctx.render('user', data);
    }
  } catch (err) {
    ctx.err = err;
    await ctx.render('error', {
      message: '哇哦，出错了！'
    });
  }
}

exports.info_update = async(ctx, next) => {
  try {
    let info = ctx.request.body;
    await UserModel.findByIdAndUpdate(ctx.session.user._id, {
      username: info.username,
      motto: info.motto
    }).exec();
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
      ctx.redirect('/user/setting?' + ctx.session.user._id);
    } else {
      await ctx.render('error', {
        message: '旧密码错误'
      });
    }
  } catch (err) {
    console.log(err);
  }
}