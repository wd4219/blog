const mongoose = require('mongoose');
const articleModel = require('../models/article');
const TagModel = require('../models/tag');
const CategoryModel = require('../models/category');
const Tag = require('../controllers/tag');
const Category = require('../controllers/category');
const fs = require('fs');
const client = require('../../config/oss');
const marked = require('marked');
const Comment = require('../controllers/comment');
let res_model = (code, message, data) => {
  return {
    code: code,
    message: message,
    data: data ? data : {}
  }
}
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});
//保存文章
exports.save_article = async(ctx, next) => {
  let req = ctx.request.body;
  req.description = marked(req.description);
  let tags_id = await Tag.save_tag(ctx);
  let category_content = await Category.save_category(ctx);
  let _article = await articleModel.findOne({
    title: req.title
  }).exec();
  let res = {};
  let result = {};
  try {
    if (_article) {
      res = await _article.update({
        description: req.description,
        tag: tags_id,
        category: category_content,
        meta: {
          createAt: _article.meta.createAt,
          updateAt: Date.now()
        }
      });
      result = await client.put('article/content/' + res._id + '.md', new Buffer(req.content));
    } else {
      _article = new articleModel({
        title: req.title,
        description: req.description,
        tag: tags_id,
        category: category_content
      });
      res = await _article.save();
      result = await client.put('article/content/' + res._id + '.md', new Buffer(req.content));
    }
    if (result.res.status == '200') {
      ctx.body = res_model(0, '保存成功', {});
    } else {
      ctx.body = res_model(-1, '保存失败', {});
    }
  } catch (err) {
    ctx.body = res_model(-1, '保存出错', {});
  }
}
// 获取文章摘要信息
exports.find_article_all = async(ctx, next) => {
  let page = ctx.request.query.page || 1;
  let num = 7;
  let result = await articleModel.find({}, {
    meta: 0,
    __v: 0,
  }).populate('tag', {
    meta: 0,
    __v: 0,
    count: 0
  }).limit(num).skip(num * (page - 1)).exec();
  let count = await articleModel.count().exec();
  if (count < 7 * (page - 1)) {
    ctx.flashMessage.danger = '页数已突破天际';
  } else {
    if (Math.ceil(count / num) > page && page > 1) {
      await ctx.render('index', {
        prev: page - 1,
        next: parseInt(page) + 1,
        article_list: result
      })
    } else if (Math.ceil(count / num) == page && page > 1) {
      await ctx.render('index', {
        prev: page - 1,
        next: -1,
        article_list: result
      });
    } else if (Math.ceil(count / num) > page && page == 1) {
      await ctx.render('index', {
        prev: -1,
        next: parseInt(page) + 1,
        article_list: result
      });
    } else {
      await ctx.render('index', {
        prev: -1,
        next: -1,
        article_list: result
      });
    }
  }
};
// 获取文章列表信息
exports.find_article_list = async(ctx, next) => {
  let result = {};
  let list = await articleModel.find({}, {
    meta: 0,
    __v: 0,
    tag: 0,
    category: 0,
    description: 0
  }).populate('tag', {
    meta: 0,
    __v: 0,
    _id: 0,
    count: 0
  }).exec();
  result.list = list || [];
  await ctx.render('list', result);
};

// 通过tag获取文章列表
exports.get_article_tag = async(ctx, next) => {
  let tag_id = ctx.params.tag_id;
  let result = {};
  try {
    let list = await articleModel.find({
      tag: tag_id
    }, {
      meta: 0,
      __v: 0,
      description: 0,
      tag: 0
    }).exec();
    let tag = await TagModel.findById(tag_id, {
      meta: 0,
      __v: 0,
      _id: 0
    }).exec();
    result.list = list;
    result.tag_content = tag.content;
    await ctx.render('list', result);
  } catch (err) {
    ctx.err = err;
    console.log(err);
  }
}
// 通过id查找博客
exports.find_article_id = async(ctx, next) => {
  let article_id = ctx.params.id;
  if (article_id.length !== 24) {
    ctx.flashMessage.danger = '文章不存在或已被删除';
    ctx.redirect('back');
  } else {
    let result = await articleModel.findById(article_id, {
      __v: 0,
      meta: 0
    }).populate('tag', {
      __v: 0,
      _id: 0,
      meta: 0
    }).exec();
    if (result) {
      this.update_read_amount(ctx, next)
      let article_content = await client.get('article/content/' + article_id + '.md');
      result.content =marked(article_content.content.toString('utf8'));
      result.comment = await Comment.find_comment_article(ctx, next);
      result.article_footer = await this.find_article_prev_next(ctx, next);
      await ctx.render('article', result);
    } else {
      ctx.flashMessage.danger = '文章不存在或已被删除';
      ctx.redirect('back');
    }
  }
}
// 更新阅读量
exports.update_read_amount = async(ctx, next) => {
  let _id = ctx.params.id;
  try {
    articleModel.findOneAndUpdate({
      _id: _id
    }, {
      $inc: {
        read_amount: +1
      }
    }).exec();
  } catch (err) {
    ctx.status = 500
    ctx.err = err;
  }
}

exports.update_like_amount = async(ctx, next) => {
  let _id = ctx.params.id;
  articleModel.findOneAndUpdate({
    _id: _id
  }, {
    $inc: {
      like_amount: +1
    }
  }).exec();
}
// 获取热门文章的列表
exports.find_hot_article_list = async(ctx, next) => {
  try {
    let result = await articleModel.find({}, {
      tag: 0,
      like_amount: 0,
      meta: 0,
      description: 0,
      __v: 0,
      publish_time: 0
    }).sort({
      "read_amount": -1
    }).limit(5).exec();
    return result;
  } catch (err) {
    ctx.status = 500;
    ctx.err = err;
  }
}
// 获取分页
exports.find_article_prev_next = async(ctx, next) => {
  let id = ctx.params.id;
  let article_footer = {};
  article_footer.prev = (await articleModel.find({
    '_id': {
      '$lt': id
    }
  }, {
    tag: 0,
    like_amount: 0,
    meta: 0,
    description: 0,
    __v: 0,
    pulish_time: 0,
    read_amount: 0
  }).sort({
    _id: -1
  }).limit(1))[0]
  article_footer.next = (await articleModel.find({
    '_id': {
      '$gt': id
    }
  }, {
    tag: 0,
    like_amount: 0,
    meta: 0,
    description: 0,
    __v: 0,
    pulish_time: 0,
    read_amount: 0
  }).sort({
    _id: 1
  }).limit(1))[0]
  return article_footer;
}