const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let ArticleSchema = new Schema({
  title:{
    type:String,
    default:'',
    unique:true
  },
  author:{
    type:String,
    unique:true,
    default:'ezblog'
  },
  publish_time:{
    type:String,
  },
  tag:[
    {type:Schema.Types.ObjectId,ref:'Tag'}
  ],
  category:{
    type:String
  },
  description:{
    type:String
  },
  read_amount:{
    type:Number,
    default:0
  },
  like_amount:{
    type:Number,
    default:0
  },
  meta:{
    createAt:{
      type:Date,
      default:new Date()
    },
    updateAt:{
      type:Date,
      default:new Date()
    }
  }
});
ArticleSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
    this.publish_time = moment(new Date()).format('YYYY-MM-DD');
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

module.exports = ArticleSchema;