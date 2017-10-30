function editor() {
  var simplemde = new SimpleMDE({
    autofocus: false,
    blockStyles: {
      bold: "**",
      italic: "*"
    },
    element: document.getElementById("comment-text"),
    forceSync: true,
    indentWithTabs: false,
    insertTexts: {
      horizontalRule: ["", "\n\n-----\n\n"],
      table: ["",
        "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"
      ],
    },
    lineWrapping: true,
    parsingConfig: {
      allowAtxHeaderWithoutSpace: true,
      strikethrough: false,
      underscoresBreakWords: true,
    },
    placeholder: "请输入评论",
    previewRender: function (plainText, preview) { // Async method
      preview.innerHTML = marked(plainText);
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
      });
      return preview.innerHTML;
    },
    promptURLs: false,
    renderingConfig: {
      singleLineBreaks: false,
    },
    showIcons: ["code", "table"],
    spellChecker: false,
    status: false, // Another optional usage, with a custom status bar item that counts keystrokes
    styleSelectedText: false,
    tabSize: 2,
    toolbar: ["bold", "italic", "heading", "code", "quote", "unordered-list", "ordered-list",
      {
        name: "link",
        action: function (editor) {
          $('.link-alert').addClass('show');
          $('.mask').fadeIn();
        },
        className: "fa fa-link",
        title: "Create Link",
      },
      {
        name: "image",
        action: function () {
          $('.image-alert').addClass('show');
          $('.mask').fadeIn();
        },
        className: "fa fa-image",
        title: "Create Image",
      },

      "table", "preview",
    ]
  });
  document.querySelector('.editor-preview-side').className += ' markdown-wd';

  $('.comment-list-item .bottom-content .reply').click(function (e) {
    let username = '@' + $(e.target).data('user') + ' ';
    $('<input>').attr({
      type: 'hidden',
      name: 'comment[cid]',
      value: $(e.target).data('cid')
    }).appendTo('#comment-form');
    simplemde.value(username);
    simplemde.codemirror.setCursor(username.length + 1);
    simplemde.codemirror.focus();
  });
  $(' .title .iconfont').click(function (e) {
    $('.link-alert').removeClass('show');
    $('.image-alert').removeClass('show');
    $('.mask').fadeOut();
  });
  $('.link-alert .link-btn').click(function () {
    var str = ["[" + $('.link-alert .link-title').val() + "](" + $('.link-alert .link-text').val(), ')'];
    replaceSelection(simplemde.codemirror, false, str);
    $('.link-alert').removeClass('show');
    $('.mask').fadeOut();
  });
  $('.mask').on('click',function(){
    $('.link-alert').removeClass('show');
    $('.image-alert').removeClass('show');
    $('.mask').fadeOut();
  });
  function replaceSelection(cm, active, startEnd, url) {
    if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
      return;
    var text;
    var start = startEnd[0];
    var end = startEnd[1];
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");
    if (url) {
      end = end.replace("#url#", url);
    }

    text = cm.getSelection();
    cm.replaceSelection(start + text + end);
    startPoint.ch += start.length;
    if (startPoint !== endPoint) {
      endPoint.ch += start.length;
    }
    endPoint.ch += 1;
    cm.focus();
  }

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
        // document.getElementById('dropbox').innerHTML = '';
        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
          type: "post",
          url: "/comment/image",
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
              var str = ["![" + response.data.filename + "](" + response.data.url, ")"];
              replaceSelection(simplemde.codemirror, false, str);
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
  jQuery("time.timeago").timeago();
  // highlight高亮代码
  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block);
  });

  if (document.getElementById("comment-text")) {
    editor();
  }
  event_func();
});

function event_func() {
  //点击发表评论栏的登录或注册
  $('.comment-container .no-login').click(function (e) {
    if ($(e.target).hasClass('signin')) {
      $('.mask').fadeIn();
      $('.sign-box').addClass('show');
      $('.signin-box').show();
      $('.signup-box').hide();
    }
    if ($(e.target).hasClass('signup')) {
      $('.mask').fadeIn();
      $('.sign-box').addClass('show');
      $('.signup-box').show();
      $('.signin-box').hide();
    }
  });
  //删除评论
  $('.delete').click(function (e) {
    var msg = "你确定要删除这条评论吗？";
    if (confirm(msg) == true) {
      $.ajax({
        type: 'post',
        url: '/delete_comment',
        data: {
          _csrf:$('.csrf').val(),
          cid: $(e.target).data('cid')
        },
        success: function (response) {
          console.log(response);
          if (response.code == 0) {
            $(e.target).parents('.comment-list-item').remove();
          }
        }
      })
    }
  });
  //点赞评论
  $('.icon-dianzan').click(function (e) {
    $.ajax({
      type: 'post',
      url: '/like',
      data: {
        _csrf:$('.csrf').val(),
        cid: $(e.target).data('cid')
      },
      success: function (response) {
        if (response.code == 1) {
          $(e.target).css({
            color: '#d7d7d7'
          });
          $(e.target).siblings('.like_count').text(response.data.like_amount);
        } else if (response.code == 2) {
          $(e.target).css({
            color: '#20a0ff'
          });
          $(e.target).siblings('.like_count').text(response.data.like_amount);
        }
      }
    })
  });
}