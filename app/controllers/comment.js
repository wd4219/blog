const mongoose = require('mongoose');
const CommentModel = require('../models/comment');

exports.save_comment = async (ctx,next)=>{
  let id = ctx.params.id;
  let comment = ctx.request.body.comment;
  try{
    let _comment = new CommentModel({content:comment,article:id,user:ctx.session._id});
    let result = await _comment.save();
    console.log(result);
  }catch(err){

  }
}