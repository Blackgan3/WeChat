$(function(){

  searchMsgList(0,10);
});
function searchMsgList(pi,ps){
    var sendMsg   = $('#sendMsg').val();
    var acceptMsg = $('#acceptMsg').val();
    var queryData = {
      pageIndex:pi,
      pageSize :ps
    };
    if(sendMsg!=null && sendMsg!=""){
      queryData.sendMsg = sendMsg;
    }
    if(acceptMsg!=null && acceptMsg!=""){
      queryData.acceptMsg = acceptMsg;
    }
    $.ajax({
      type:'post',
      dataType:'json',
      data    : queryData,
      url     :'/msgList',
      success: function(data){
            console.log(data);
            var obj = data.msgList;
            var crhtml = ahtml = "",j = obj.length;
            if(j == 0 ||  obj[0] == null){
                crhtml = '<tr><td colspan="12">没有找到您想要的相关结果</td></tr>';
                $('#sec').css('display','none');
            }else{
                $('#sec').css('display','inline-block');
                console.log(obj);
                for(var i = 0;i < j; i++){
                    crhtml += '<tr>';
                    crhtml += '<td>';
                    crhtml += i+1;
                    crhtml += '</td>';
                    crhtml += '<td>';
                    if( !(obj[i].username == null) ) {
                        crhtml += obj[i].username;
                    }
                   
                    crhtml += '</td>';
                    crhtml += '<td>'
                    if( !(obj[i].content == null)){
                        crhtml += obj[i].content;
                    }
                    crhtml += '</td>'
                    crhtml += '<td>'
                    if( !(obj[i].sayto == null)){
                        crhtml += obj[i].sayto;
                    }
                    crhtml += '</td>'  
                    crhtml += '<td>';
                    crhtml += '<a  onclick="deleteMsg('+obj[i].id+')" >删除</a> &nbsp;&nbsp;&nbsp;';
                    crhtml += '<a  onclick="lookMsgDetail('+obj[i].id+')">编辑</a>';
                    crhtml += '</td>';                  
                    crhtml += '</tr>';

                }
                // 分页
                ahtml = '<span>[';
                ahtml += '<span id="pageIndex">';
                ahtml += parseInt(pi) + 1;
                ahtml += '</span>';
                ahtml +='/'+data.totalPages+']</span>';
                ahtml += '<a href="javascript:searchMsgList(0,';
                ahtml += ps;
                ahtml +=')">首页</a>';
                if(j<ps){
                    ahtml += '<ul class="pager" style="display: inline-block;">';
                    ahtml += '<li><a href="javascript:searchMsgList(';
                    var pre=0;
                    if(pi>0){
                        pre=pi-1;
                    }
                    ahtml +=pre;
                    ahtml +=',';
                    ahtml += ps;
                    ahtml += ')">上一页</a></li>';
                    ahtml += '<li><a href="javascript:void(0);">下一页</a></li>';
                    ahtml += '</ul>';
                }else{
                    ahtml += '<ul class="pager" style="display: inline-block;">';
                    ahtml += '<li><a href="javascript:searchMsgList(';
                    var pre=0;
                    if(pi>0){
                        pre=pi-1;
                    }
                    ahtml +=pre;
                    ahtml +=',';
                    ahtml += ps;
                    ahtml += ')">上一页</a></li>';
                    if(parseInt(pi) + 1 < data.totalPages){
                        ahtml += '<li><a href="javascript:searchMsgList( ';
                        ahtml += parseInt(pi) + 1;
                        ahtml += ',';
                        ahtml += ps;
                        ahtml +=');">下一页</a></li>';
                    }else{
                        ahtml += '<li><a href="javascript:void(0);">下一页</a></li>';
                    }
                    ahtml += '</ul>';
                }
                ahtml += '<span style="width: 90px;display: inline-block">';
                ahtml += '<input type="text" class="form-control" placeholder="跳转页数" id="number">';
                ahtml += '</span>';
                ahtml += '<ul class="pager" style="display: inline-block;">';
                ahtml += '<li><a href="javascript:switchAlreadyPage()">go</a></li>';
                ahtml += '</ul>';
                ahtml += '<a href="javascript:searchMsgList(';
                ahtml += data.totalPages - 1;
                ahtml += ',';
                ahtml += ps;
                ahtml +=')">末页</a>';
                ahtml += '<span> 共<span id="totalPages" pages="';
                ahtml +=  data.totalPages;
                ahtml += '">'+data.totalElements+'</span>条</span>';
                $('#alreadyRepay_page').html(ahtml);
            }
            $('#userListTable').html(crhtml);
      }
    });
}
// 跳转页数
function switchAlreadyPage(){
    var number = parseInt($("#number").val());
    if(!number)return false;
    var totalPages = parseInt($('#totalPages').attr('pages'));
    if(number > totalPages)return false;
    var options=$("#sec option:selected");
    var number = number - 1;
    searchMsgList( number,options.val());

}
// 切换行数
function switchAlreadySize(){
    var options=$("#sec option:selected");
    searchMsgList( 0,options.val());
}

//删除消息的函数
function deleteMsg(id) {
    var id = id;
    //发送请求，去后台删除该信息
    $.ajax({
        type:'post',
        url :'/deleteMsg',
        dataType:'json',
        data:{
            id:id
        },
        success:function(data){
            alert(data.msg);
        },
        error:function(e){
            alert(e);
        }
    })
}
//编辑消息前的查看消息的函数
function lookMsgDetail(id) {
    var id = id;
    $.ajax({
        type:'post',
        url:'/lookMsgDetail',
        dataType:'json',
        data:{id:id},
        success:function(data){
            //做渲染模态框的处理
            var msg = data.msg;
            $('#adminlookFromto').val(msg.username);
            $('#adminLookContent').val(msg.content);
            $('#adminLookSayto').val(msg.sayto);
            $('#adminCompileMsgDetailModel').modal('show');
        },
        error:function(e){
            alert(e);
        }
    })
}
//编辑消息的函数
function deleteMsg(id) {
    var id = id;
    //发送请求，去后台删除该信息
    $.ajax({
        type:'post',
        url :'/compileMsg',
        dataType:'json',
        data:{
            id:id
        },
        success:function(data){
            alert(data.msg);
        },
        error:function(e){
            alert(e);
        }
    })
}