const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CategorySchema = new Schema({
  content:{
    type:String,
    unique:true
  },
  count:{
    type:Number,
    default:1
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
CategorySchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
    this.count = this.count+1;
  }
  next();
});
module.exports = CategorySchema;