const router = require('koa-router')()
const Article = require('../app/controllers/article')
const Tag = require('../app/controllers/tag')

router.prefix('/admin')


router.get('/login', async (ctx, next) =>{
  await ctx.render('./admin/login',{
    title:'登录后台'
  });
});
router.get('/',async (ctx,next)=>{
  if(true){
    await ctx.render('./admin/index.html',{});
  }else{
    ctx.redirect('/admin/login');
  }
});
router.post('/create_article',Article.save_article);
router.get('/get_tag',Tag.get_tag_list);  
router.get('/get_article_all',Article.find_article_all);
router.get('/get_article_list',Article.find_article_list);
router.get('/get_article_tag',Article.get_article_tag);

module.exports = router