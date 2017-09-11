const router = require('koa-router')()
const marked = require('marked');
const Article = require('../app/controllers/article')
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
  let data = await Article.find_article_all(ctx,next);
  console.log(data.data[0]);
  await ctx.render('index',data.data[0]);
})

router.get('/article',async (ctx,next)=>{
  await ctx.render('article',{
    title:'文章标题',
    article:marked("# aaa")
  });
});
router.get('/list',async (ctx,next)=>{
  await ctx.render('list',{
    title:'文章列表'
  });
});

module.exports = router
