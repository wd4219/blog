const mongoose = require('mongoose');
const CommentModel = require('../models/comment');
const UserModel = require('../models/user');
const marked = require('marked');
const xss = require('xss');

exports.save_comment = async (ctx,next)=>{
  let id = ctx.params.id;
  let comment = ctx.request.body.comment;
  let username = comment.content.match(/^@.*?(?= )/);
  if(username){
    username = comment.content.match(/^@.*?(?= )/)[0].slice(1);
  }
  if(comment.content.replace(/^@.*?(?= )/,' ').trim() == ''){
   await ctx.render('error',{message:'评论内容不能为空'});
  }
  else{
    let html = xss(marked(comment.content))
    try{
      let _user = await UserModel.findOne({username:username}).exec();
      if(comment.cid && _user){
        await CommentModel.findOneAndUpdate({_id:comment.cid},{$push:{'reply':_user._id}});
      }
      let _comment = new CommentModel({content:html,article:id,user:ctx.session._id});
      let result = await _comment.save();
      ctx.redirect('/article/'+id);
    }catch(err){
      throw({message:'评论提交失败'})
    }
  }
}
exports.find_comment_article = async(ctx,next)=>{
  let id = ctx.params.id;
  try{
    let result  = await CommentModel.find({article:id},{meta:0,__v:0,reply:0}).populate('user',{__v:0,meta:0,password:0}).exec();
    return result;
  }catch(err){
    console.log(err);
    return [];
  }
}

exports.delete_comment = async(ctx,next)=>{
  let cid = ctx.request.body.cid;
  try{
    let result = await CommentModel.remove({_id:cid}).exec();
    if(result.result.ok == 1){
      ctx.body = {
        code:0,
        message:'删除成功',
        data:{}
      }
    }
    else{
      ctx.body = {
        code:-1,
        message:'删除失败',
        data:{}
      }
    }
  }catch(err){
    console.log(err);
  }
}

exports.like_comment = async(ctx,next)=>{
  let cid = ctx.request.body.cid;
  try{
    let _comment = await CommentModel.findById(cid).exec();
    if(_comment.like_user.indexOf(ctx.session._id)>-1){
      _comment.like_user = _comment.like_user.replace(ctx.session._id+',','');
      _comment.like_amount -= 1;
      await _comment.save();
      ctx.body = {
        code:1,
        message:'取消赞',
        data:{
          like_amount: _comment.like_amount,
        }
      }
    }
    else{
      _comment.like_user += ctx.session._id+',';
      _comment.like_amount += 1;
      await _comment.save();
      ctx.body = {
        code:2,
        message:'点赞',
        data:{
          like_amount: _comment.like_amount,
        }
      }
    }
  }catch(err){
    console.log(err);
  }
}