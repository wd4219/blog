const mongoose = require('mongoose');
const ArticleSchema = require('../schemas/article');
const ArticleModel = mongoose.model('Article',ArticleSchema);

module.exports = ArticleModel;