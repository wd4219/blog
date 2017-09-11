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
    ctx.body = res_model(0,'获取标签列表成功',tag_list);
  }catch(err){
    ctx.body = res_model('-1','获取标签列表失败');
  }
};