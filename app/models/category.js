const mongoose = require('mongoose');
const CategorySchema = require('../schemas/category');
const CategoryModel = mongoose.model('Category',CategorySchema);

module.exports = CategoryModel;