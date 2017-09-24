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
  let html = marked(xss(comment.content))
  try{
    let _user = await UserModel.findOne({username:username}).exec();
    if(comment.cid && _user){
      await CommentModel.findOneAndUpdate({_id:comment.cid},{$push:{'reply':_user._id}});
    }
    let _comment = new CommentModel({content:html,article:id,user:ctx.session._id});
    let result = await _comment.save();
    ctx.redirect('/article/'+id);
  }catch(err){
    ctx.redirect('/error');
  }
}
exports.find_comment_article = async(ctx,next)=>{
  let id = ctx.params.id;
  try{
    let result  = await CommentModel.find({article:id},{meta:0,__v:0,reply:0}).populate('user',{__v:0,meta:0,password:0}).exec();
    return result;
  }catch(err){
    return [];
  }
}