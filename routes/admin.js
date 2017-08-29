const router = require('koa-router')()

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
  

module.exports = router