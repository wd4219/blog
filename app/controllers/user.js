const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
let  res_model = (code,message,data) => {
  return {
      code: code,
      messageg: message,
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
    ctx.body = res_model(0,'注册成功',result);
  }catch(err){
    console.log(err);
    ctx.body = res_model(-1,'注册失败');
  }
}

exports.sign_in = async(ctx,next)=>{
  let user = ctx.request.body;
  
  try{
    let _user = await UserModel.findOne({email:user.email}).exec();
    if(bcrypt.compareSync(user.password,_user.password)){
      ctx.body = res_model(0,'登录成功',_user);
    }
    else{
      ctx.body = res_model(0,'登录失败');
    }
  }catch(err){
    console.log(err);
  }
}