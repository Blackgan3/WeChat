$(function(){


});
function searchMsgList(pi,pz){
    var sendMsg   = $('#sendMsg').val();
    var acceptMsg = $('#acceptMsg').val();
    $.ajax({
      type:'post',
      dataType:'json',
      data    : {sendMsg:sendMsg,acceptMsg:acceptMsg},
      url     :'/msgList',
      success : function(data){
        //请求聊天信息成功,在这里进行聊天信息的渲染
        
      },
      error   : function(error){
        alert(error);
      }
    });
}