const mongoose = require('mongoose');
const CommentModel = require('../models/comment');

exports.save_comment = async (ctx,next)=>{
  let id = ctx.params.id;
  let comment = ctx.request.body.comment;
  try{
    let _comment = new CommentModel({content:comment,article:id,user:ctx.session._id});
    let result = await _comment.save();
    ctx.redirect('/article/'+id);
  }catch(err){
    ctx.redirect('/error');
  }
}
exports.find_comment_article = async(ctx,next)=>{
  let id = ctx.params.id;
  try{
    let result  = await CommentModel.find({article:id},{meta:0,__v:0,}).populate('user',{__v:0,meta:0,password:0}).exec();
    console.log(result);
    return result;
  }catch(err){
    return [];
  }
}