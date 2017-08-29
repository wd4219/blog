const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let ArticleSchema = new Schema({
  title:{
    type:String,
    default:'',
    unique:true
  },
  pulish_time:new Date(),
  label:{
    type:String,
    default:[]
  },
  id:{
    type:ObjectId,
  },
  content:{
    type:Text
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
  }
});