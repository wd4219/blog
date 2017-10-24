const router = require('koa-router')()
const Article = require('../app/controllers/article')
const Tag = require('../app/controllers/tag')
const User = require('../app/controllers/user')

router.prefix('/admin')


router.get('/',User.admin,async (ctx,next)=>{
  await ctx.render('./admin/index.html',{});
});


router.post('/create_article',User.admin,Article.save_article);
router.get('/get_tag',User.admin,Tag.get_tag_list);  
router.get('/get_article_all',User.admin,Article.find_article_all);
router.get('/get_article_list',User.admin,Article.find_article_list);
router.get('/get_article_tag',User.admin,Article.get_article_tag);

module.exports = router