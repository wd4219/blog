
function event_func(){
  $('.signin-form').submit(function(e){
    let email = $('.signin-form .email input').val();
    let password = $('.signin-form .password input').val();
    if (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email.trim())) {
      $('.signin-form .email .error').text('');
    } else {
       $('.signin-form .email .error').text('邮箱有误');
       e.preventDefault();
    }
    if (password.trim() == '' || password.trim().length < 6) {
      $('.signin-form .password .error').text('密码不能为少于6位');
      e.preventDefault();
    }
    else{
      $('.signin-form .password .error').text('');
    }
  });
  $('.signup-form').submit(function(e){
    let username = $('.signup-form .username input').val();
    let email = $('.signup-form .email input').val();
    let password = $('.signup-form .password input').val();
    let comfirm_password = $('.signup-form .comfirm-password input').val();
    if (username.trim() == '') {
      $('.signup-form .username .error').text('昵称不能为空');
      e.preventDefault();
    } else {
      if(/^[\w\u4E00-\u9FA5\uF900-\uFA2D]*$/.test(username)){
        $('.signup-form .username .error').text('');
        $.ajax({
          type: 'get',
          url: '/user/check_username',
          data: {
            username: username
          },
          success: function (response) {
            if (response.code != 0) {
              $('.signup-form .username .error').text(response.message);
              e.preventDefault();
            }
            else{
              $('.signup-form .username .error').text('');
            }
          }
        });
      }
      else{
        $('.signup-form .username .error').text('用户名只能由中英文或下划线组成，且不能以下划线开头和结尾')
        e.preventDefault();
      }
    }
    if (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email.trim()) || /^1[3|4|5|7|8][0-9]{9}$/.test(email.trim())) {
      $('.signup-form .email .error').text('');
      $.ajax({
        type: 'get',
        url: '/user/check_email',
        data: {
          email: email
        },
        success: function (response) {
          if (response.code != 0) {
            $('.signup-form .email .error').text(response.message);
          }
          else{
            $('.signup-form .email .error').text('');
          }
        }
      });
    } else {
       $('.signup-form .email .error').text('邮箱有误');
       e.preventDefault();
    }
    if (password.trim() == '' || password.trim().length < 6) {
      $('.signup-form .password .error').text('密码不能为少于6位');
      e.preventDefault();
    }
    else{
      $('.signup-form .password .error').text('');
    }
    if(password.trim() != comfirm_password.trim()){
      $('.signup-form .comfirm-password .error').text('确认密码必须和密码相同');
      e.preventDefault();
    }
    else{
      $('.signup-form .comfirm-password .error').text('');
    }
  });
  $('.signup-form .username input').change(function (e) {
    let username = $('.signup-form .username input').val();
    if (username.trim() == '') {
      $('.signup-form .username .error').text('昵称不能为空');
    } else {
      if(/^[\w\u4E00-\u9FA5\uF900-\uFA2D]*$/.test(username)){
        $('.signup-form .username .error').text('');
        $.ajax({
          type: 'get',
          url: '/user/check_username',
          data: {
            username: username
          },
          success: function (response) {
            if (response.code != 0) {
              $('.signup-form .username .error').text(response.message);
            }
            else{
              $('.signup-form .username .error').text('');
            }
          }
        });
      }
      else{
        $('.signup-form .username .error').text('用户名只能由中英文或下划线组成，且不能以下划线开头和结尾')
      }
    }
    
  });
  $('.signup-form .email input').change(function (e) {
    let email = $('.signup-form .email input').val();
    if (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email.trim()) || /^1[3|4|5|7|8][0-9]{9}$/.test(email.trim())) {
      $('.signup-form .email .error').text('');
      $.ajax({
        type: 'get',
        url: '/user/check_email',
        data: {
          email: email
        },
        success: function (response) {
          if (response.code != 0) {
            $('.signup-form .email .error').text( response.message);
          }
          else{
            $('.signup-form .email .error').text('');
          }
        }
      });
    } else {
       $('.signup-form .email .error').text('邮箱有误');
    }
  });
}

$(function(){
  event_func();
});

