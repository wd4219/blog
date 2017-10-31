const router = require('koa-router')();
const marked = require('marked');
const Article = require('../app/controllers/article');
const Tag = require('../app/controllers/tag');
const Category = require('../app/controllers/category');
const multiparty = require('multiparty');
const util = require('util');
const fs = require('fs');
const path = require('path');
const client = require('../config/oss');
const User = require('../app/controllers/user');
const Comment = require('../app/controllers/comment');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

router.get('/', async(ctx, next) => {
  try{
    let data = {};
    let article = await Article.find_article_all(ctx, next);
    let hot_article_list = await Article.find_hot_article_list(ctx, next);
    let tags = await Tag.get_tag_list(ctx, next);
    let user = await User.allow_auth(ctx,next);
    data.user = user;
    data.article_list = article.list;
    data.prev = article.prev;
    data.next = article.next;
    data.hot_article_list = hot_article_list;
    data.tags = tags;
    data.csrf = ctx.csrf;
    await ctx.render('index', data);
  }
  catch(err){
    ctx.response.status = 500;
  }
})

router.get('/article/:id', async(ctx, next) => {
  Article.update_read_amount(ctx, next);
  try{
    let data = {};
    let article = await Article.find_article_id(ctx, next);
    let hot_article_list = await Article.find_hot_article_list(ctx, next);
    let tags = await Tag.get_tag_list(ctx, next);
    let article_footer = await Article.find_article_prev_next(ctx, next);
    let comment = await Comment.find_comment_article(ctx,next);
    data = article.data;
    let user = await User.allow_auth(ctx,next);
    data.user = user;
    data.content = marked(data.content);
    data.hot_article_list = hot_article_list;
    data.tags = tags;
    data.article_footer = article_footer;
    data.comment = comment; 
    data.csrf = ctx.csrf;
    await ctx.render('article', data);
  }
  catch(err){
    console.log(err);
    ctx.status = 500;
  }
});
router.get('/list', async(ctx, next) => {
  try{
    let list = await Article.find_article_list(ctx, next);
    let data = {};
    let user = await User.allow_auth(ctx,next);
    let tags = await Tag.get_tag_list(ctx, next);
    let hot_article_list = await Article.find_hot_article_list(ctx, next);
    data.hot_article_list = hot_article_list;
    data.user = user;
    data.list = list.data;
    data.tags = tags;
    data.csrf = ctx.csrf;
    await ctx.render('list', data);
  }
  catch(err){
    ctx.status = 500;
  }
});

router.get('/list/tag/:tag_id', async(ctx, next) => {
  try{
    let result = await Article.get_article_tag(ctx, next);
    let data = {};
    data.list = result.list;
    let user = await User.allow_auth(ctx,next);
    let hot_article_list = await Article.find_hot_article_list(ctx, next);
    let tags = await Tag.get_tag_list(ctx, next);
    data.hot_article_list = hot_article_list;
    data.tags = tags;
    data.user = user;
    data.tag_content = result.tag_content;
    data.csrf = ctx.csrf;
    await ctx.render('list', data);
  }
  catch(err){
    ctx.status = 500;
  }
});


router.post('/comment/image', async(ctx, next) => {
  try{
    let files = await get_file(ctx)
    let filename = files.file[0].originalFilename || path.basename(files.file[0].path);
    let stream = fs.createReadStream(files.file[0].path);
    let result = await client.putStream('article/image/' +
      filename, stream, {
        contentLength: files.file[0].size
      });
    let acl = client.putACL('article/image/' +
      filename, 'public-read')
    ctx.body = {
      code:0,
      message:'保存成功',
      data:{
        url:result.url,
        filename:filename
      }
    }
  }catch(err){
    console.log(err);
    ctx.body = {
      code:-1,
      message:'保存失败',
      data:{
        url:''
      }
    }
  }
});

function get_file(ctx) {
  return new Promise((resolve, reject) => {
    var form = new multiparty.Form();
    form.parse(ctx.req, function (err, fields, files) {
      if(err){
        reject(err);
      }
      else{
        resolve(files);
      }
    });
  });
}

router.post('/comment/:id',Comment.save_comment)

router.post('/delete_comment',Comment.delete_comment);

router.post('/like',Comment.like_comment);
module.exports = router