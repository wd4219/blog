$(function(){
  $('.submit-blog').on('click',function(){
    let data = {};
    data.tags = [];
    let tag_list = $('.blog-label').val().split(',');
    for(let i = 0;i < tag_list.length;i++){
      data.tags.push({content:tag_list[i]});
    }
    data.title = 'vuejs 学习教程（一）';
    data.description = $('.blog-description').val();
    data.content = $('.blog-content').val();
    $.ajax({
      type:'post',
      url:'/admin/api/create_article',
      data:data,
      success:function(res){
        if(res.code == 0){
          alert(res.message);
        }
        else{
          alert(res.message);
        }
      }
    });
  });
});