const mongoose = require('mongoose');
const TagSchema = require('../schemas/tag');
const TagModel = mongoose.model('Tag',TagSchema);

module.exports = TagModel;