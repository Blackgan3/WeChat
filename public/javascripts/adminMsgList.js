$(function(){


});
function searchMsgList(pi,pz){
    var sendMsg   = $('#sendMsg').val();
    var acceptMsg = $('#acceptMsg').val();
    var queryData = {
      pageIndex:pi,
      pageSize :pz
    };
    if(sendMsg!=null && sendMsg!=""){
      
    }
    $.ajax({
      type:'post',
      dataType:'json',
      data    : {sendMsg:sendMsg,acceptMsg:acceptMsg},
      url     :'/msgList',
      success: function(obj){
            //console.log(obj.data.totalPages);
            var crhtml = ahtml = "",j = obj.data.content.length;
            if(j == 0 ||  obj.data.content[0] == null){
                crhtml = '<tr><td colspan="12">没有找到您想要的相关结果</td></tr>';
                $('#sec').css('display','none');
            }else{
                $('#sec').css('display','inline-block');
                for(var i = 0;i < j; i++){
                    crhtml += '<tr>';
                    crhtml += '<td>';
                    crhtml += i+1;
                    crhtml += '</td>';
                    crhtml += '<td>';
                    if( !(obj.data.content[i].id == null) ) {
                        crhtml += obj.data.content[i].id;
                    }
                   
                    crhtml += '</td>';
                    crhtml += '<td>';
                    if( !(obj.data.content[i].amount == null) ) {
                         crhtml += $.number(obj.data.content[i].amount,2);
                    }
                   
                    crhtml += '</td>';
                    crhtml += '<td>';
                    if( !(obj.data.content[i].cardNumber == null) ) {
                        crhtml += obj.data.content[i].cardNumber;
                    }
                   
                    crhtml += '</td>';
                    crhtml += '<td>';
                    if( !(obj.data.content[i].repaymentTime == null) ) {
                        crhtml += $.getYmdHisDateTime(obj.data.content[i].repaymentTime);
                    }
                   
                    crhtml += '</td>';
                    crhtml += '<td>';
                   
                    crhtml += '罚款';
  
                   
                    crhtml += '</td>';
                    crhtml += '<td>';
                    if( !(obj.data.content[i].status == null) ) {
                        crhtml += obj.data.content[i].status;
                    }
                   
                    crhtml += '</td>';
                    crhtml += '</tr>';

                }
                // 分页
                ahtml = '<span>[';
                ahtml += '<span id="pageIndex">';
                ahtml += parseInt(pi) + 1;
                ahtml += '</span>';
                ahtml +='/'+obj.data.totalPages+']</span>';
                ahtml += '<a href="javascript:searchAlreadyRepaymentList(0,';
                ahtml += ps;
                ahtml +=')">首页</a>';
                if(j<ps){
                    ahtml += '<ul class="pager" style="display: inline-block;">';
                    ahtml += '<li><a href="javascript:searchAlreadyRepaymentList(';
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
                    ahtml += '<li><a href="javascript:searchAlreadyRepaymentList(';
                    var pre=0;
                    if(pi>0){
                        pre=pi-1;
                    }
                    ahtml +=pre;
                    ahtml +=',';
                    ahtml += ps;
                    ahtml += ')">上一页</a></li>';
                    if(parseInt(pi) + 1 < obj.data.totalPages){
                        ahtml += '<li><a href="javascript:searchAlreadyRepaymentList( ';
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
                ahtml += '<a href="javascript:searchAlreadyRepaymentList(';
                ahtml += obj.data.totalPages - 1;
                ahtml += ',';
                ahtml += ps;
                ahtml +=')">末页</a>';
                ahtml += '<span> 共<span id="totalPages" pages="';
                ahtml +=  obj.data.totalPages;
                ahtml += '">'+obj.data.totalElements+'</span>条</span>';
                $('#alreadyRepay_page').html(ahtml);
            }
            $('#alreadyRepay_table').html(crhtml);
      },
      error   : function(error){
        alert(error);
      }
    });
}