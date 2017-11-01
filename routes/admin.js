const router = require('koa-router')()
const Article = require('../app/controllers/article')
const Tag = require('../app/controllers/tag')
const User = require('../app/controllers/user')
const Category = require('../app/controllers/category')


router.get('/',User.admin,async (ctx,next)=>{
  await ctx.render('./admin/index');
});

// 添加文章类别
router.post('/category', User.admin,Category.save_category);

//获取类别列表
router.get('/category', Category.get_category_list);

//获取标签提示列表
router.get('/suggest_tag', Tag.get_tag_list_of_value);
router.post('/create_article',User.admin,Article.save_article);
router.get('/get_tag',User.admin,Tag.get_tag_list);  
router.get('/get_article_all',User.admin,Article.find_article_all);
router.get('/get_article_list',User.admin,Article.find_article_list);
router.get('/get_article_tag',User.admin,Article.get_article_tag);

module.exports = router