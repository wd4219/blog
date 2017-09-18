const mongoose = require('mongoose');
const TagModel = require('../models/tag');

let  res_model = (code,message,data) => {
  return {
      code: code,
      messageg: message,
      data: data?data:{}
  }
};
// 保存标签
exports.save_tag = async(ctx, next) => {
  let tags = ctx.request.body.tags;
  let tags_id =[]; 
  for (let i = 0; i < tags.length; i++) {
    let _tag = new TagModel(tags[i]);
    let tag = await TagModel.findOne({
      'content': _tag.content
    }).exec();
    let result;
    if (tag) {
      result = await tag.save(function (err) {});
      tags_id.push(result._id);
    } else {
      result = await _tag.save(function (err) {});
      tags_id.push(result._id);
    }
  }
  return tags_id;
};
//获取标签列表
exports.get_tag_list = async(ctx,next)=>{
  try{
    let tag_list =  await TagModel.find({},{meta:0,__v:0}).exec();
    return res_model(0,'获取标签列表成功',tag_list);
  }catch(err){
     return res_model('-1','获取标签列表失败',{});
  }
};

exports.get_tag_list_of_value = async(ctx,next)=>{
  try{
    let value = ctx.request.query.value;
    let tag_list = await TagModel.find({content:eval("/^"+value+"/")}).limit(6);
    ctx.body = {
      code:0,
      message:"获取数据成功",
      data:tag_list
    };
  }catch(err){
    console.log(err);
    ctx.body ={
      code:-1,
      message:"获取数据失败",
      data:[]
    };
  }
}