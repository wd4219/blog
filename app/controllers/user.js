const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
let  res_model = (code,message,data) => {
  return {
      code: code,
      message: message,
      data: data?data:{}
  }
};
//注册用户
exports.sign_up = async(ctx,next)=>{
  let user = ctx.request.body;
  user.password = bcrypt.hashSync(ctx.request.body.password);
  try{
    let _user = new UserModel(user);
    let result = await _user.save();
    if(result){
      ctx.session = result;
      ctx.redirect('/');
    }
    else{
      ctx.redirect('/user/signup');
    }
  }catch(err){
    console.log(err);
  }
}
// 登录
exports.sign_in = async(ctx,next)=>{
  let user = ctx.request.body;
  try{
    let _user = await UserModel.findOne({email_phone:user.email_phone}).exec();
    if(bcrypt.compareSync(user.password,_user.password)){
      ctx.session = _user;
      ctx.redirect('/');
    }
    else{
      ctx.redirect('/user/signin');
    }
  }catch(err){
    console.log(err);
  }
}

exports.check_username = async(ctx,next)=>{
  let username = ctx.request.query.username;
  try{
    let _user = await UserModel.findOne({username:username}).exec();
    if(_user){
      ctx.body = res_model(-1,'昵称已存在,请重新输入');
    }
    else{
      ctx.body = res_model(0,'昵称可以使用');
    }
  }catch(err){
    ctx.body = res_model(-2,'出错了',err);
  }
}

exports.check_email_phone = async(ctx,next)=>{
  let email_phone = ctx.request.query.email_phone;
  try{
    let _user = await UserModel.findOne({email_phone:email_phone}).exec();
    if(_user){
      ctx.body = res_model(-1,'手机或邮箱已存在,请重新输入');
    }
    else{
      ctx.body = res_model(0,'手机或邮箱可以使用');
    }
  }catch(err){
    ctx.body = res_model(-2,'出错了',err);
  }
}

exports.allow_auth = async(ctx,next)=>{
  if(ctx.session && ctx.session._id){
   return ctx.session;
  }
  else{
    return null;
  }
}
exports.sign_out = async(ctx,next)=>{
  if(ctx.session && ctx.session.username){
    ctx.session ={};
  }
  else{
  }
  ctx.redirect('/');
}

exports.admin = async(ctx,next)=>{
  if(ctx.session && ctx.session.rule == 10){
   await next();
  }
  else{
    ctx.response.status = 404;
    await ctx.render('404');
  }
}

exports.info = async(ctx,next)=>{
  if(ctx.session && ctx.session.username){
    try{
      let user = await UserModel.findById(ctx.session._id,{__v:0,password:0,rule:0}).exec();
      let data  = {user,csrf:ctx.csrf,flash:ctx.flash.get()};
      await ctx.render('user',data);
    }
    catch(err){
      ctx.err = err;
      await ctx.render('error',{message:'用户不存在'});
    }
  }
  else{
    await ctx.render('error',{message:'你还未登录，请登录后查看'});
  }
}

exports.findUserById = async(ctx,next)=>{
  try{
    let user_info = await UserModel.findById(ctx.query.id,{__v:0,password:0,email_phone:0,rule:0}).exec();
    if(!user_info){
      await ctx.render('error',{message:'用户不存在'});
    }
    else{
      let data = {};
      if(ctx.session && ctx.session.username){
        data  = {user:ctx.session,user_info:user_info,csrf:ctx.csrf};
      } 
      else{
        data = {user_info:user_info,csrf:ctx.csrf}
      }
      console.log(data);
      await ctx.render('user',data);
    }
  }catch(err){
    ctx.err = err;
    await ctx.render('error',{message:'哇哦，出错了！'});
  }
}

exports.info_update = async(ctx,next)=>{
  try{
    let info = ctx.request.body;
    await UserModel.findByIdAndUpdate(ctx.session._id,{username:info.username,motto:info.motto}).exec();
    ctx.redirect('/user/setting?'+ctx.session._id);
  }catch(err){
    console.log(err);
  }
}

exports.password_update = async(ctx,next)=>{
  try{
    let password = ctx.request.body;
    let _user = await UserModel.findById(ctx.session._id).exec();
    if(bcrypt.compareSync(password.old,_user.password)){
      await UserModel.findByIdAndUpdate(ctx.session._id,{password:bcrypt.hashSync(password.new)}).exec();
      ctx.flash.set('密码修改成功');
      ctx.redirect('/user/setting?'+ctx.session._id);
    }
    else{
      await ctx.render('error',{message:'旧密码错误'});
    }
  }catch(err){
    console.log(err);
  }
}