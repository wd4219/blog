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
    ctx.session = result;
    ctx.body = res_model(0,'注册成功',result);
  }catch(err){
    console.log(err);
    ctx.body = res_model(-1,'注册失败');
  }
}

exports.sign_in = async(ctx,next)=>{
  let user = ctx.request.body;
  try{
    let _user = await UserModel.findOne({email_phone:user.email_phone}).exec();
    if(bcrypt.compareSync(user.password,_user.password)){
      ctx.session = _user;
      ctx.body = res_model(0,'登录成功',_user);
    }
    else{
      ctx.body = res_model(0,'登录失败');
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
    ctx.body = {
      code:0,
      message:'已退出登录',
    }
  }
  else{
    ctx.body = {
      code:-1,
      message:'您还未登录'
    }
  }
}