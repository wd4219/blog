const router = require('koa-router')()
const Article = require('../app/controllers/article')
const Tag = require('../app/controllers/tag')

router.prefix('/admin')

router.get('/create_article', async (ctx, next) =>{
  await ctx.render('./admin/create_article',{
    title:'发表博客'
  });
});

router.get('/login', async (ctx, next) =>{
  await ctx.render('./admin/login',{
    title:'登录后台'
  });
});
router.get('/nav', async (ctx, next) =>{
  await ctx.render('./admin/nav',{
    title:'登录后台'
  });
});

router.post('/api/create_article',Article.save_article);
router.post('/api/create_tag',Tag.save_tag);  
router.get('/api/get_article',Article.find_article);
module.exports = router