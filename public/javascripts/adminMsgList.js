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
      },
      error   : function(error){
        alert(error);
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
