$(function () {
  tagcloud({
    fontsize: 16,       //基本字体大小
    radius: 100,         //滚动半径
    mspeed: "normal",   //滚动最大速度
    ispeed: "normal",   //滚动初速度
    direction: 135,     //初始滚动方向
    keep: false          //鼠标移出组件后是否继续随鼠标滚动
  }
  );
      $.ajax({
        type:'post',
        url:'/admin/api/create_article',
        data:{
          title:'dadadas',
          content:'dasdasdasdasda',
          description:'dadasdasdasda',
          tags:[{content:'标签1'},{content:'标签2'}]
        },
        success:function(res){
          console.log(res);
        }  
      });
});