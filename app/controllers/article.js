const mongoose = require('mongoose');
const articleModel = require('../models/article');
const TagModel = require('../models/tag');
const Tag = require('../controllers/tag')
let  res_model = (code,message,data) => {
  return {
      code: code,
      messageg: message,
      data: data?data:{}
  }
}
exports.save_article = async(ctx, next) => {
  let req = ctx.request.body;
  let tags_id = await Tag.save_tag(ctx);
  let _article = await articleModel.findOne({title:req.title}).exec();
  let res = {}; 
  try{
    if(_article){
      res = await _article.update({
        content:req.content,
        description:req.description,
        tag:tags_id,
        meta:{
          createAt:_article.meta.createAt,
          updateAt:Date.now()
        }
      });
    }
    else{
      _article = new articleModel({
        title:req.title,
        content:req.content,
        description:req.description,
        tag:tags_id
      });
      res = await _article.save();
    }
    ctx.body = res_model(1,'保存成功',{});
  }catch(err){
    console.log(err);
    ctx.body = res_model(-1,'保存失败',{});
  }
}

exports.find_article = async(ctx, next) => {
  let result = await articleModel.find().populate('tag').exec();
  ctx.body = result;
}