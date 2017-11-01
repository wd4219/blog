// 事件处理函数合集
function event_func() {
  $('.avatar .update').click(function (e) {
    $('.image-alert').addClass('show');
    $('.mask').fadeIn();
  });
  $(' .title .iconfont').click(function (e) {
    $('.image-alert').removeClass('show');
    $('.mask').fadeOut();
  });
  var dropbox = document.getElementById("dropbox");
  dropbox.addEventListener("dragleave", function (e) {
    dropbox.style.borderColor = '#d7d7d7';
  }, false);
  dropbox.addEventListener("dragenter", function (e) {
    dropbox.style.borderColor = '#D3DCE6';
    e.stopPropagation();
    e.preventDefault();
  }, false);
  dropbox.addEventListener("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
  }, false);
  dropbox.addEventListener("drop", function (e) {
    e.stopPropagation();
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, false);

  var handleFiles = function (files) {
    $('.upload-btn').hide();
    $('.progress-box').show();
    if (files.length > 1) {
      alert('一次只能拖一个图片');
    } else {
      let file = files[0];
      if (file.type.match(/image*/)) {
        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
          type: "post",
          url: "/user/avatar?_csrf="+$('meta[name="csrf-token"]').attr('content'),
          data: formData,
          cache: false,
          contentType: false,
          processData: false, //此处指定对上传数据不做默认的读取字符串的操作
          success: function (response) {
            if (response.code == 0) {
              $('.progress').attr('stroke-dashoffset', 300);
              $('.percent').text(0 + '%');
              $('.progress-box').hide();
              $('.upload-btn').show();
              $('.image-alert').removeClass('show');
              $('.mask').removeClass('show');
            } else {
              alert('上传失败，请重新上传');
            }
          },
          error: function (r) {
            alert("文件上传出错！");
          },
          progress: function (e) {
            if (e.lengthComputable) {
              var pct = (e.loaded / e.total) * 300;
              $('.progress').attr('stroke-dashoffset', 300 - pct);
              $('.percent').text(Math.round(e.loaded / e.total) * 100 + '%');
            } else {
              console.warn('Content Length not reported!');
            }
          }
        });
      }
    }
  }

  $('#file-upload').change(function (e) {
    handleFiles($(this)[0].files);
  });
}
$(function () {
  event_func();
});