(function (win){
    win.validateForms= function (formSeletor){
        var check=true;
        //验证输入框
        $(formSeletor+" input[name]").each(function() {
            if(this.hasAttribute('required')){
                if(!this.value || this.value.trim() == "") {
                    layer.alert(this.placeholder,{icon:5});
                    check=false;
                }else{
                    check=vfield(this);
                }
            }else{
                check=vfield(this);
            }
            if(!check)return false;
        });

        //验证下拉选择框
        $(formSeletor+" select[name]").each(function() {
            if(this.getAttribute('required')){
                //若当前input为空，则toast提醒
                if(!this.value || this.value.trim() == "") {
                    var label = this.parentNode.previousElementSibling;
                    layer.alert('请选择'+label.innerText,{icon:5});
                    check=false;
                }
            }

            if(!check)return false;
        });

        return check;
    };
    function vfield(field) {
        var reg=field.getAttribute('data-reg'),check=true;
        if(reg){//正则验证
            var pat = new RegExp(reg);
            if (!pat.test(field.value)) {
                layer.alert(field.getAttribute('data-reg-error'),{icon:5});
                check=false;
            }
        }
        if(field.type=='number'){
            if(field.validity.badInput){
                layer.alert('输入数字有误！',{icon:5});
                check=false;
            }
        }
        return check;
    }
    win.serializeFormData=function (formSeletor){
        var obj={};
        //验证输入框
        $(formSeletor+" input[name]").each(function() {
                if(this.type=='radio'){
                    if(this.checked)obj[this.name]=this.value;
                }else{
                    obj[this.name]=this.value;
                }
        });
        //验证下拉选择框
        $(formSeletor+" select[name]").each(function() {
                obj[this.name]=this.value;
        });
        return obj;
    }
})(window);