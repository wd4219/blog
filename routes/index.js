const router = require('koa-router')();
const marked = require('marked');
const Article = require('../app/controllers/article');
const Tag = require('../app/controllers/tag');
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

router.get('/', async (ctx, next) => {
  let data = {};
  let article = await Article.find_article_all(ctx,next);
  let tags = await Tag.get_tag_list(ctx,next);
  data.article = article.data[0];
  data.tags = tags.data;
  await ctx.render('index',data);
})

router.get('/article/:id',async (ctx,next)=>{
  let data = await Article.find_article_id(ctx,next);
  data.data.content = marked(data.data.content);
  await ctx.render('article',data.data);
});
router.get('/list',async (ctx,next)=>{
  await ctx.render('list',{
    title:'文章列表'
  });
});

module.exports = router
