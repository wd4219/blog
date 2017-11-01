const multiparty = require('multiparty');
const fs = require('fs');
const client = require('../config/oss');
const path = require('path');

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
    console.log(err);
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