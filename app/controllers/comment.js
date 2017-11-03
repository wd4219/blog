const mongoose = require('mongoose');
const CommentModel = require('../models/comment');
const UserModel = require('../models/user');
const marked = require('marked');
const xss = require('xss');
const _ = require('lodash');

// 保存评论
exports.save_comment = async(ctx, next) => {
  let id = ctx.params.id;
  let comment = ctx.request.body.comment;
  let reply_username_list = comment.content.match(/@.*?(?= )/g);
  reply_username_list = _.uniq(reply_username_list);
  if (reply_username_list.length > 10) {
    ctx.flashMessage.danger = '最多只能@10个人哦'
    ctx.redirect('back');
  } else {
    if (reply_username_list.length > 0) {
      reply_username_list = _.map(reply_username_list, function (val) {
        return val.slice(1);
      });
    }
    let html = xss(marked(comment.content))
    if (comment.content.replace(/@.*?(?= )/g, ' ').trim() == '') {
      ctx.flashMessage.danger = '评论内容不能为空';
      ctx.redirect('back');
    } else {

      for (let i = 0; i < reply_username_list.length; i++) {
        let username = reply_username_list[i];
        let _user = await UserModel.findOne({
          username: username
        }).exec();
        if (comment.cid && _user) {
          await CommentModel.findOneAndUpdate({
            _id: comment.cid
          }, {
            $push: {
              'reply': _user._id
            }
          });
          html = html.replace(eval("/@" + username + " /g"), `<a style="color:#20A0FF" href="/user?id=${_user.id}">@${username}</a>`)
        } else if (_user) {
          html = html.replace(eval("/@" + username + " /g"), `<a style="color:#20A0FF" href="/user?id=${_user.id}">@${username}</a>`)
        }
      };
      let _comment = new CommentModel({
        content: html,
        article: id,
        user: ctx.session.user._id
      });
      let comment_new = await _comment.save();
      if (comment_new) {
        ctx.redirect('/article/' + id);
      } else {
        ctx.flashMessage.danger = '评论提交失败';
        ctx.redirect('/article/' + id);
      }
    }
  }
}

//根据文章查找评论
exports.find_comment_article = async(ctx, next) => {
  let id = ctx.params.id;
  if (id.length !== 24) {
    ctx.flashMessage.danger = '获取评论信息失败';
    return [];
  }
  try {
    let result = await CommentModel.find({
      article: id
    }, {
      meta: 0,
      __v: 0,
      reply: 0
    }).populate('user', {
      __v: 0,
      meta: 0,
      password: 0
    }).exec();
    return result;
  } catch (err) {
    ctx.status = 500;
    ctx.err = err;
    return [];
  }
}
// 删除评论
exports.delete_comment = async(ctx, next) => {
  let cid = ctx.request.body.cid;
  let result = await CommentModel.remove({
    _id: cid
  }).exec();
  if (result.result.ok == 1) {
    ctx.body = {
      code: 0,
      message: '删除成功',
      data: {}
    }
  } else {
    ctx.body = {
      code: -1,
      message: '删除失败',
      data: {}
    }
  }
}
// 点赞或者取消赞
exports.like_comment = async(ctx, next) => {
  let cid = ctx.request.body.cid;
  let _comment = await CommentModel.findById(cid).exec();
  if (_comment.like_user.indexOf(ctx.session.user._id) > -1) {
    _comment.like_user = _comment.like_user.replace(ctx.session.user._id + ',', '');
    _comment.like_amount -= 1;
    await _comment.save();
    ctx.body = {
      code: 1,
      message: '取消赞',
      data: {
        like_amount: _comment.like_amount,
      }
    }
  } else {
    _comment.like_user += ctx.session.user._id + ',';
    _comment.like_amount += 1;
    await _comment.save();
    ctx.body = {
      code: 2,
      message: '点赞',
      data: {
        like_amount: _comment.like_amount,
      }
    }
  }
}