const router = require('koa-router')();
const Article = require('../app/controllers/article');


// 获取文章摘要列表
router.get('/',Article.find_article_all);

router.get('article/:id',Article.find_article_id);

router.get('list', Article.find_article_list);

router.get('list/tag/:tag_id', Article.get_article_tag);

module.exports = router;