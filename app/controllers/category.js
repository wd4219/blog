const mongoose = require('mongoose');
const CategoryModel = require('../models/category');

let  res_model = (code,message,data) => {
  return {
      code: code,
      message: message,
      data: data?data:{}
  }
};
// 保存类别
exports.save_category = async(ctx, next) => {
  let category_content = ctx.request.body.category;
  try{
    let category = await CategoryModel.findOne({
      'content': category_content
    }).exec();
    let result;
    if (category) {
      result = await category.save();
    } else {
      let _category = new CategoryModel({content:category_content});
      result = await _category.save();
      ctx.body = {
        code:0,
        message:'保存成功',
      }
      return result.content;
    }
  }catch(err){
    console.log(err);
    ctx.body = {
      code:-1,
      message:'保存失败',
    }
    return '';
  }
  
};
//获取类别列表
exports.get_category_list = async(ctx,next)=>{
  try{
    let category_list =  await CategoryModel.find({},{meta:0,__v:0,_id:0}).exec();
    ctx.body = {
      code:0,
      message:'获取数据成功',
      data:category_list
    }
    return category_list;
  }catch(err){
    console.log(err);
    ctx.body = {
      code:-1,
      message:'获取数据失败',
      data:[]
    }
    return [];
  }
};