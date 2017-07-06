/**
 * Created by Administrator on 2017/7/5.
 */
$(function(){

});
function submitUserAvator(){
    var imageFile = $('#userAvator');
    console.log(imageFile[0].files[0]);
    var queryData = imageFile[0].files[0];
    console.log(queryData);
    alert('upload');
    $.ajax({
        type:'post',
        url :'/upload/uploadAvator',
        data:{data:'123'},
        dataType:'json',
        success:function(data){
            console.log(data);
        },
        error:function(error){
            console.log(error);
        }
    })
}