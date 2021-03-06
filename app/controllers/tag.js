const mongoose = require('mongoose');
const TagModel = require('../models/tag');

let res_model = (code, message, data) => {
  return {
    code: code,
    message: message,
    data: data ? data : {}
  }
};
// 保存标签
exports.save_tag = async(ctx, next) => {
  let tags = ctx.request.body.tags;
  let tags_id = [];
  try {
    for (let i = 0; i < tags.length; i++) {
      let tag = await TagModel.findOne({
        'content': tags[i]
      }).exec();
      let result;
      if (tag) {
        result = await tag.save();
        tags_id.push(result._id);
      } else {
        let _tag = new TagModel({
          content: tags[i]
        });
        result = await _tag.save();
        tags_id.push(result._id);
      }
    }
    return tags_id;
  } catch (err) {
    ctx.err = err;
    return [];
  }
};
//获取标签列表
exports.get_tag_list = async(ctx, next) => {
  let tag_list = await TagModel.find({}, {
    meta: 0,
    __v: 0
  }).exec();
  return tag_list;
};
// 根据传进来的值模糊查询tag表，返回符合条件的列表
exports.get_tag_list_of_value = async(ctx, next) => {
  try {
    let value = ctx.request.query.value;
    let tag_list = await TagModel.find({
      content: eval("/^" + value + "/")
    }).limit(6);
    ctx.body = {
      code: 0,
      message: "获取数据成功",
      data: tag_list
    };
  } catch (err) {
    ctx.body = {
      code: -1,
      message: "获取数据失败",
      data: []
    };
  }
}