const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  avatar:{
    type:String,
    default:'//ezblog.oss-cn-beijing.aliyuncs.com/avatar/default-avatar.jpg',
  },
  username:{
    type:String,
    unique:true,
  },
  email_phone:{
    type:String,
    unique:true
  },
  password:{
    type:String,
  },
  rule:{
    type:Number,
    default:0,
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

module.exports = UserSchema;