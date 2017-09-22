const mongoose = require('mongoose');
const CommentSchema = require('../schemas/comment');
const CommentModel = mongoose.model('Comment',CommentSchema);

module.exports = CommentModel;