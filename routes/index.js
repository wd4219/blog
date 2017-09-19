const router = require('koa-router')();
const marked = require('marked');
const Article = require('../app/controllers/article');
const Tag = require('../app/controllers/tag');
const Category = require('../app/controllers/category');
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

router.get('/', async(ctx, next) => {
  let data = {};
  let article = await Article.find_article_all(ctx, next);
  let hot_article_list = await Article.find_hot_article_list(ctx, next);
  let tags = await Tag.get_tag_list(ctx, next);
  data.article_list = article.data;
  data.hot_article_list = hot_article_list;
  data.tags = tags.data;
  await ctx.render('index', data);
})

router.get('/article/:id', async(ctx, next) => {
  Article.update_read_amount(ctx, next);
  let data = {};
  let article= await Article.find_article_id(ctx, next);
  let hot_article_list = await Article.find_hot_article_list(ctx, next);
  let tags = await Tag.get_tag_list(ctx, next);
  let article_footer = await Article.find_article_prev_next(ctx,next);
  data = article.data;
  data.content = marked(data.content);
  data.hot_article_list = hot_article_list;
  data.tags = tags.data;
  data.article_footer = article_footer;
  await ctx.render('article', data);
});
router.get('/list', async(ctx, next) => {
  let list = await Article.find_article_list(ctx, next);
  let data = {};
  data.list = list.data;
  await ctx.render('list', data);
});

router.get('/list/tag/:tag_id', async(ctx, next) => {
  let result = await Article.get_article_tag(ctx, next);
  let data = {};
  data.list = result.list;
  data.tag_content = result.tag_content;
  await ctx.render('list', data);
});
// 添加文章类别
router.post('/admin/category',Category.save_category);

//获取类别列表
router.get('/admin/category',Category.get_category_list);

//获取标签提示列表
router.get('/admin/suggest_tag',Tag.get_tag_list_of_value);
module.exports = router