const router = require('koa-router')()

router.prefix('/admin')

router.get('/create_article', async (ctx, next) =>{
  await ctx.render('create_article',{
    title:'发表博客'
  });
});

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router