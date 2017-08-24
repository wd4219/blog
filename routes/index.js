const router = require('koa-router')()
const marked = require('marked');
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
  await ctx.render('index', {
    title: '王迪的博客-前端笔记与交流'
  })
})

router.get('/article',async (ctx,next)=>{
  await ctx.render('article',{
    title:'文章标题',
    article:marked("```javascript\n const a = 1;\nconst a = 1;\nconst a = 1;\n```")
  });
});

module.exports = router
