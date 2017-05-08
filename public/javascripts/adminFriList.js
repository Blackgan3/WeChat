
$(document).ready(function(){
  //绑定删除按钮事件
  $('.removeUserBtn').on('click',function(){
      //触发删除事件，这时应向后台发送请求去删除这个用户
      var r = confirm('是否确定删除该用户');
      var username  = $(this).data('username');
      if(r){
         $.ajax({
             type:'post',
             url :'/removeUser',
             dataType:'json',
             data:{
                 username:username
             },
             success:function (data) {
                 alert(data.msg);
                 window.location.reload();
             },
             error:function(error){
                 alert(error);
             }

         })
      }
  });
  //绑定编辑按钮事件
  $('.compileUserBtn').on('click',function(){
      //触发删除事件，这时应向后台发送请求去删除这个用户
      $('#adminCompileUserInfoModel').modal('show');
      var username = $(this).data('username');
      $.ajax({
          type: 'post',
          url: '/lookUserInfo',
          dataType: 'json',
          data: {
              username: username
          },
          success: function (data) {
              console.log(data.user);
          },
          error: function (error) {
              alert(error);
          }

      })
  });
    $('.disabledUserBtn').on('click',function(){
        //触发删除事件，这时应向后台发送请求去删除这个用户
        $('#adminCompileUserInfoModel').modal('show');
        var r = confirm("是否确定禁用该用户");
        var username = $(this).data('username');
        if(r){
            $.ajax({
                type: 'post',
                url: '/disabledUser',
                dataType: 'json',
                data: {
                    username: username
                },
                success: function (data) {
                    alert(data.msg);
                },
                error: function (error) {
                    alert(error);
                }

            })
        }
    });

});
