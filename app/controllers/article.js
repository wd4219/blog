const mongoose = require('mongoose');
const articleModel = require('../models/article');
const TagModel = require('../models/tag');
const Tag = require('../controllers/tag');
const fs = require('fs');
const client = require('../../config/index.js');
let res_model = (code, message, data) => {
  return {
    code: code,
    message: message,
    data: data ? data : {}
  }
}

//保存文章
exports.save_article = async(ctx, next) => {
  let req = ctx.request.body;
  let tags_id = await Tag.save_tag(ctx);
  let _article = await articleModel.findOne({title:req.title}).exec();
  let res = {}; 
  let result ={};
  try{
    if(_article){
      res = await _article.update({
        description:req.description,
        tag:tags_id,
        meta:{
          createAt:_article.meta.createAt,
          updateAt:Date.now()
        }
      });
      result = await client.put('article/'+res._id+'.md', new Buffer(req.content));
    }
    else{
      _article = new articleModel({
        title:req.title,
        description:req.description,
        tag:tags_id
      });
      res = await _article.save();
      result = await client.put('article/'+res._id+'.md', new Buffer(req.content));
    }
    if(result.res.status == '200'){
      ctx.body = res_model(0,'保存成功',{});
    }
    else{
      ctx.body = res_model(-1,'保存失败',{});
    }
  }catch(err){
    ctx.body = res_model(-1,'保存失败',{});
  }
}
// 获取文章摘要信息
exports.find_article_all = async(ctx, next) => {
  try {
    let result = await articleModel.find({}, {
      meta: 0,
      _id: 0,
      __v: 0,
    }).populate('tag', {
      meta: 0,
      _id: 0,
      __v: 0,
      count: 0
    }).exec();
    return res_model(0, '获取文章列表成功', result);
  } catch (err) {
    return res_model(0, '获取文章列表失败');
  }
};
// 获取文章列表信息
exports.find_article_list = async(ctx, next) => {
  try {
    let result = await articleModel.find({}, {
      meta: 0,
      _id: 0,
      __v: 0,
      tag: 0,
      description: 0
    }).populate('tag', {
      meta: 0,
      _id: 0,
      __v: 0,
      count: 0
    }).exec();
    ctx.body = res_model(0, '获取文章列表成功', result);
  } catch (err) {
    ctx.body = res_model(0, '获取文章列表失败');
  }
};

// 通过tag获取文章列表
exports.get_article_tag = async(ctx, next) => {
  let tag_id = ctx.request.query.tag_id;
  try {
    let result = await articleModel.find({
      tag: tag_id
    }, {
      meta: 0,
      _id: 0,
      __v: 0,
      description: 0,
      tag: 0
    }).exec();
    ctx.body = res_model(0, '获取文章列表成功', result);
  } catch (err) {
    console.log(err);
    ctx.body = res_model(0, '获取文章列表失败');
  }
}

exports.find_article_id = async (ctx,next)=>{
  let article_id = ctx.params.id;
  try{
    let result = await articleModel.findById(article_id).populate('tag').exec();
    let article_content = await client.get('/article/'+article_id+'.md');
    result.content = article_content.content.toString('utf8');
    return res_model(0, '获取文章列表成功', result)
  }catch(err){
    return res_model(0, '获取文章列表失败',{});
  }
}