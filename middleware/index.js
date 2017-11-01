const UserModel = require('../app/models/user');
const Article = require('../app/controllers/article');
const Tag = require('../app/controllers/tag');
exports.help = async(ctx,next)=>{
  let user = null;
  if(!ctx.state){
    ctx.state = {};
  }
  if(ctx.session && ctx.session._id){
    user = await UserModel.findById(ctx.session._id,{__v:0,password:0}).exec();
  }
  let tags = await Tag.get_tag_list(ctx, next);
  let hot_article_list = await Article.find_hot_article_list(ctx, next);
  ctx.state.user = user;
  ctx.state.tags = tags;
  ctx.state.hot_article_list = hot_article_list;
  ctx.state.csrf = ctx.csrf;
  await next();
}

exports.error = async(ctx, next) =>{
  try {
    await next();
    if (ctx.status === 404);
  } catch (err) {
    let status = err.status || 500;
    if (status < 0) {
      status = 500;
    }
    ctx.status = status;
    ctx.err = err;
    await ctx.render('error', {message:err.message});
  }
}