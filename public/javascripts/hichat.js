/*
 *hichat v0.4.2
 *Wayou Mar 28,2014
 *MIT license
 *view on GitHub:https://github.com/wayou/HiChat
 *see it in action:http://hichat.herokuapp.com/
 */

window.onload = function() {
    var sayto    = '';
    var chatType = '';
    var hichat = new HiChat();
    hichat.init();
};
var HiChat = function() {
    this.socket = null;
};
HiChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        //当前进入主页,进行socket.io连接
        this.socket.on('connect', function() {
           document.getElementById('loginWrapper').style.display = 'block';
            that.socket.emit('login', USERNAME);   
        });

        //服务器端访问成功后执行
        this.socket.on('loginSuccess', function() {
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
             //登录成功后进行渲染当前用户列表中的用户
            that.socket.emit('onLineUser');
            that._addFriList(USERNAME);
        });

        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        //系统消息
        this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' 进入聊天室' : ' 离开聊天室');
            that._displayNewMsg('系统消息 ', msg, 'red','all');
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' 名用户' : ' 名用户') + ' 当前在线';
        });

        //发送消息
        this.socket.on('newMsg', function(msg, color, Afromto,Asayto) {
            //判断私聊对象是否是当前客户端如果是则进入处理流程
            console.log(Asayto,USERNAME); 
            if(Asayto == USERNAME){
                //判断当前客户端聊天私聊窗口是否是发来消息的用户,如果是，则更新当前聊天窗口的信息
                if(sayto==Afromto){
                    that._displayNewMsg(Asayto, color,Afromto);
                }
            }
            
        });
        //发送群组消息
        this.socket.on('newGroupMsg', function(msg, color, Afromto,Asayto) {
            //判断私聊对象是否是当前客户端如果是则进入处理流程
            that._displayGroupNewMsg(Afromto, color,Asayto);
        });

        //发送图片
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });
        //重新渲染当前在线用户
        this.socket.on('addUser',function(){
            that._addUserList();
        });

        //处理服务器端发送过来的好友请求
        this.socket.on('addFriReq',function(toOne,fromOne){
            var toOne   = toOne,
                fromOne = fromOne;
            if(toOne==USERNAME){
                //alert(fromOne+'请求添加你为好友');
                var confirmReq = confirm(fromOne+'请求添加你为好友');
                if(confirmReq){
                    //发送消息告诉fromOne同意了好友请求，同时将该好友添加至好友列表中
                    that.socket.emit('agreeReq',toOne,fromOne);
                }else{
                    //发送消息告诉fromOne拒绝了好友请求
                    that.socket.emit('refuseReq',toOne,fromOne);
                }
            }
        });
        //处理服务器发送过来的好友请求失败消息
        this.socket.on('refuseReqAssign',function(toOne,fromOne){
            if(fromOne == USERNAME){
                alert(toOne+'拒绝了你的好友请求');
                //好友请求被拒绝，不用去做任何反应
            }
        });
        //处理服务器发送过来的好友请求成功消息
        this.socket.on('agreeReqAssign',function(toOne,fromOne){
            if(fromOne == USERNAME){
                alert(toOne+'已经同意了你的好友请求');
                //同意了好友请求后，将好友关系存储到好友列表中
                $.post('/saveFriRelation',{master:fromOne,friend:toOne},
                    function(data,status){
                        alert(data.msg);
                    }
                );
            }
        });
        //发送消息按钮绑定事件
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                
                //将发送的信息存入数据库
                console.log(sayto);
                $.ajax({
                    type:'post',
                    dataType:'json',
                    url:'/postMsg',
                    data:{
                        username:USERNAME,
                        msg  :msg,
                        sayto:sayto,
                    },
                    success:function(data){
                        if(chatType == 'group'){
                            //驱动其他用户进行消息渲染
                            that.socket.emit('postGroupMsg', msg, color,USERNAME,sayto);
                            //本页面进行消息渲染
                            that._displayGroupNewMsg(USERNAME, color,sayto);
                        }else{
                            that.socket.emit('postMsg', msg, color,USERNAME,sayto);
                            that._displayNewMsg(USERNAME, color,sayto);
                        }
                    },
                    error:  function(e){
                        alert(e);
                    }
                });
                return;
            };
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('我', msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        //发送图片信息时绑定的事件
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    //????这个地方需要再进行修改
                    that._displayNewMsg('系统消息', '!your browser doesn\'t support fileReader', 'red','all');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('我', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        //事件委托代理
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
        //用户列表中的聊天室用户绑定事件
        document.getElementById('userListWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'li') {
                //判断当前要添加的用户是否已经是自己的好友
                $.post('/judgeFriend',{master:USERNAME,friend:target.innerHTML},
                    function(data,status){
                        if(data.status == 300){
                            alert(data.msg);
                        }else{
                            that.socket.emit('sendFriendReq',target.innerHTML,USERNAME);
                        }
                    }
                );
                //向特定的好友发送好友请求
            };
        }, false);
        //给好友列表中的每一个好友绑定点击事件
        document.getElementById('friendListWrapper').addEventListener('click',function(e){
            var target = e.target;
            if(target.nodeName.toLowerCase() == 'li'){
                //将进行一系列改变，来将聊天窗口变成单聊窗口
                if(confirm("确定要私聊"+target.innerHTML+"吗？")){
                    //进行私聊处理
                    sayto = target.innerHTML;
                    $('#chatFrame').css('display','block');
                    that._privateChat(target.innerHTML,USERNAME);
                }
            }
        });
        //给群组列表中的每一个群组绑定点击事件
        document.getElementById('groupListWrapper').addEventListener('click',function(e){
            var target = e.target;
            if(target.nodeName.toLowerCase() == 'li'){
                //将进行一系列改变，来将聊天窗口变成单聊窗口
                if(confirm("确定要去"+target.innerHTML+"进行聊天吗吗？")){
                    //进行群聊处理
                    chatType = 'group';
                    sayto = target.innerHTML;
                    $('#chatFrame').css('display','block');
                    that._groupChat(target.innerHTML,USERNAME);
                }
            }
        })
    },
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    },
    //根据发送的消息进行私聊渲染界面    
    _displayNewMsg: function(user,color,sayto) {
        var container = document.getElementById('historyMsg'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
        //去后台请求所有的聊天消息
        $.ajax({
            type    :'post',
            dataType:'json',
            url     :'/getChatMsg',
            data    : {sayto:sayto,fromto:user},
            success : function(data){
                if(data.status===200){
                    console.log(data.msg);
                    container.innerHTML='';
                    for(var i=0;i<data.msg.length;i++){
                        var msgToDisplay = document.createElement('p');
                        msgToDisplay.style.color = color || '#000';
                        msgToDisplay.innerHTML = data.msg[i].username + '<span class="timespan"></span>' + data.msg[i].content;
                        container.appendChild(msgToDisplay);
                        container.scrollTop = container.scrollHeight;
                    }
                }
            },
            error   : function(error){
                alert(error);
            }
        });
    },
    //根据发送的消息进行群组渲染界面
    _displayGroupNewMsg:function(user,color,sayto){
        var container = document.getElementById('historyMsg'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
        //去后台请求所有的聊天消息
        $.ajax({
            type    :'post',
            dataType:'json',
            url     :'/getGroupChatMsg',
            data    : {sayto:sayto,fromto:user},
            success : function(data){
                if(data.status===200){
                    console.log(data.msg);
                    container.innerHTML='';
                    for(var i=0;i<data.msg.length;i++){
                        var msgToDisplay = document.createElement('p');
                        msgToDisplay.style.color = color || '#000';
                        msgToDisplay.innerHTML = data.msg[i].username + '<span class="timespan"></span>' + data.msg[i].content;
                        container.appendChild(msgToDisplay);
                        container.scrollTop = container.scrollHeight;
                    }
                }
            },
            error   : function(error){
                alert(error);
            }
        });
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    },
    //添加用户列表
    _addUserList:function(){
        var that = this;
        $.ajax({
            type:'get',
            dataType:'json',
            url:'/getOnLineUser',
            success:function(data){
                 //console.log(data);
                 //获取到用户列表之后进行渲染
                 that._userList(data);
                },
            error:  function(e){
                alert(e);
            }
        });
    },
    //渲染当前用户列表
    _userList:function(data){
        $('.onLineUserList').empty();
        var str = '';
        for(var i=0;i<data.length;i++){
            str+='<li class="list-group-item" style="cursor:pointer;">'+data[i].username+'</li>';
        }
        $('.onLineUserList').append(str);

    },
    //当前用户的好友列表
    _addFriList:function(USERNAME){
        var that     = this,
            USERNAME = USERNAME;
        $.post('/getFriList',{master:USERNAME},
            function(data,status){
                console.log(data);
                that._friList(data);
            }
        );
    },
     //渲染当前用户的好友列表
    _friList:function(data){
        $('.friendList').empty();
        var str = '';
        for(var i=0;i<data.length;i++){

            str+='<li class="list-group-item" style="cursor:pointer;">'+data[i].friend+'</li>';
        }
        $('.friendList').append(str);
    },
    //私聊用户的事件处理
    _privateChat:function(sayto,principle){
        //私聊用户，将聊天窗口的聊天对象的名字改变
        document.getElementById('chatRoomTittle').innerHTML = sayto;
        //改变聊天框中展示的内容
        this._displayNewMsg(principle,'#000',sayto);
    },
    //群聊用户的事件处理
    _groupChat:function(sayto,principle){
        //群聊，将聊天窗口的名字变成群组的名字
        document.getElementById('chatRoomTittle').innerHTML = sayto;
        this._displayGroupNewMsg(principle,'#000',sayto);
    }
};
