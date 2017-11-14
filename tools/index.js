const multiparty = require('multiparty');
const fs = require('fs');
const client = require('../config/oss');
const path = require('path');
const crypto = require('crypto');

exports.enc_ase192 = (str,secret)=>{
    let cipher = crypto.createCipher("aes192", secret); //设置加密类型 和 要使用的加密密钥
    let enc = cipher.update(str, "utf8", "hex");    //编码方式从utf-8转为hex;
    enc += cipher.final("hex"); //编码方式从转为hex;
    return enc; //返回加密后的字符串
}

exports.dec_ase192 = (str,secret)=>{
    let decipher = crypto.createDecipher("aes192", secret);
    let dec = decipher.update(str, "hex", "utf8");//编码方式从hex转为utf-8;
    dec += decipher.final("utf8");//编码方式从utf-8;
    return dec;
}

exports.sha1 = function(str) {
  let sha1 = crypto.createHash("sha1");//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
  sha1.update(str);
  let res = sha1.digest("hex");  //加密后的值d
  return res;
}

exports.upload_file = async(ctx,img_path)=>{
  try{
    let files = await get_file(ctx)
    let filename = files.file[0].originalFilename || path.basename(files.file[0].path);
    let stream = fs.createReadStream(files.file[0].path);
    let result = await client.putStream(img_path +
      filename, stream, {
        contentLength: files.file[0].size
      });
    let acl = await client.putACL(img_path +
      filename, 'public-read')
    return  {
      code:0,
      message:'保存成功',
      data:{
        url:result.url,
        filename:filename
      }
    }
  }catch(err){
    return  {
      code:-1,
      message:'保存失败',
      data:{
        url:''
      }
    }
  }
}
function get_file(ctx) {
  return new Promise((resolve, reject) => {
    var form = new multiparty.Form();
    form.parse(ctx.req, function (err, fields, files) {
      if(err){
        reject(err);
      }
      else{
        resolve(files);
      }
    });
  });
}