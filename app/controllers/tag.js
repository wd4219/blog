const mongoose = require('mongoose');
const TagModel = require('../models/tag');

exports.save_tag = async(ctx, next) => {
  let tags = ctx.request.body.tags;
  let tags_id =[]; 
  for (let i = 0; i < tags.length; i++) {
    let _tag = new TagModel(tags[i]);
    let tag = await TagModel.findOne({
      'content': _tag.content
    }).exec();
    let result;
    if (tag) {
      result = await tag.save(function (err) {});
      tags_id.push(result._id);
    } else {
      result = await _tag.save(function (err) {});
      tags_id.push(result._id);
    }
  }
  return tags_id;
};