const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema = new Schema({
  content:{
    type:String
  },
  like_amount:{
    type:Number,
    default:0
  },
  like_user:{
    type:String,
    default:''
  },
  article:{
    type:Schema.Types.ObjectId,
    ref:'Article'
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:'User'
  },
  reply:[{
    type:Schema.Types.ObjectId,
    ref:'User'
  }],
  publish_time:{
    type:Date,
    default:Date.now()
  },
  meta:{
    createAt:{
      type:Date,
      default:Date.now()
    },
    updateAt:{
      type:Date,
      default:Date.now()
    }
  }
});
CommentSchema.pre('save', function (next) {
  if (this.isNew) {
    this.publish_time=this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

module.exports = CommentSchema;