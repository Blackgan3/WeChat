# WeChat
这是一个基于Express+socket.io+mongoose的Web聊天系统
---

记得从高中上课时经常偷偷的和同学们使用qq进行聊天，那时候经常需要进行下载qq，但是当时又没有那么多的流量进行下载，这就是一个很尴尬的事情了，当时就多想要有一个可以进行线上聊天的网站呀，不用每次痛苦的进行蓝牙传送软件了，现在，我从事了IT这个行业，便想要去实现当初的那个梦想吧。毕竟，不去努力的实现梦想，你会从一个梦想家变成一个幻想家。


###技术选择
---
由于从事的是前端工作,界面什么的对我来说是so easy，后台部分当然是选择了node.js，经过分析呢，数据库部分选择了mongoose,很早之前做个一个简易的聊天室，采用的是ajax轮询后台的方式实现的，这种方式对于服务器的压力很大，而且在用户量上去的的时候也会出现卡顿的现象，客户端和服务器通信使用的是webSocket协议。使用WebScoket协议，我们可以实现客户端和服务器的全双工通信，实现实时的服务器向客户端的消息推送，信息返回。由于浏览器对于WebScoket的支持性不是特别普遍，所以我们使用的是封装了WebScoket的socket.io，socket.io可以适配于所有的浏览器，因此，我们使用socket.io来实现客户端和服务端的通信。

选中MongoDB是因为它的简便性以及易操作性，聊天系统并不是说必须要严格遵守例如MySQL的CUID等准则，它允许我们可以延迟个几百毫秒收到聊天信息，其优点主要有：
```
（1）mongodb数据库体积较小，系统运行时较为灵活。
（2）可以提供对于任意类型的数据的查询。
（3）使用相应的技巧可以降低我们代码量以及提升查询速度。
（4）mongodb可以对我们之前的表格进行预加载。
```

###系统设计
---
我们简要的选择了我们要使用的技术，那么我们还需要对要做的产品进行分析设计，分析出来我们要做的产品都有哪些功能，我们要怎么样去实现这些功能，根据之前对于聊天系统的认知，我们设置系统的功能暂时分为后台管理系统和前台聊天室。其中后台管理系统有当前用户管理功能、聊天信息管理功能、而前台聊天室拥有添加好友、删除好友、好友私聊、群组群聊、修改密码、修改个人信息等功能。大概的功能模块图如下所示：


###系统的具体实现
经过上部分的分析，我们队系统有了初步的认知。该系统分为两个主体，用户登录后的主页即为聊天室主页如图1所示。系统管理员登录后的主页即为adminChat.ejs如图2所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603160554821-216765623.png)

                                        图1  聊天室主页
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603160605836-894031853.png)

                                        图2  后台管理主页
####1 登录模块
>由于是聊天系统，所以用户必须先要经过登录才能进入聊天室或者后台管理系统。因此系统的首页便是登录页，在登录页也可以进行注册。
下面以“登录”功能进行主要讲解。在登录界面，主要使用ajax去异步判断是否能登录成功，如果数据库中没有该用户，会提示用户前去注册，采用MVC设计模式。其运行界面如图3所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603160805868-1668596909.png)

                                        图3  登录界面
登录界面前台代码如下：
```html
//Form表单的提交控件代码
    <form class="form-horizontal" method="post" action="/login">
      <div class="form-group row" style="margin-top: 40px; color: white;" >
         <label for="username" class="control-label col-sm-4" >用户名</label>
         <div class="col-sm-6">
             <input type="text" class="form-control" id="username" name="username" placeholder="用户名">
          </div>
      </div>
      <div class="form-group row" style="color: white;">
         <label for="password" class="control-label col-sm-4">密码</label>
         <div class="col-sm-6">
             <input type="password" class="form-control" id="password" name="password" placeholder="密码">
          </div>
      </div>
      <div class="form-group row" style="text-align: center;">
         <button type="submit" class="btn btn-primary">登陆</button>
         <a href="/reg" class="btn btn-primary">注册</a>
      </div>
</form>
```
其后台主要代码如下：
```js
//登录操作
router.post('/login', function(req, res, next) {
  //判断用户名是否存在
  User.findOne({username:req.body.username},function (error,user) {
      if (!user) {
        //用户名不存在
        error = "用户名不存在,请先去注册";
      }else if (req.body.password !== user.password) {
        error = "密码输入错误";
      }
      if (error) {
        req.session.error = error;
        //跳转路由
        return res.redirect('/login');
      }
      req.session.success = '登录成功';
      //跳转到首页
      req.session.user = user;
      if(user.username === 'weChatAdmin'){
        //如果是管理员登录,就登录到管理员界面
        res.render('adminHome',{user:user});
      }else{
        res.render('chatHome',{user:user});
      }
  })
});
```
####2 注册模块
可以从登录页直接跳转到注册页，注册时会先判断当前的用户名是否已经被注册，如果没有被注册，就将新增的用户信息插入到用户列表中。注册时为了提高用户体验性，便没有将用户所需字段全部让新用户进行填写，用户可以到聊天室中进行个人信息的完善。注册界面如图4所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603160946914-612081269.png)

                                    图4  注册界面
注册的后台主要代码如下：
```js
//注册操作
router.post('/reg', function(req, res, next) {
  //1.查询数据库,判断当前的用户名是否存在
User.findOne({username:req.body.username},
function (error,user) {
  //用户已经存在
  if (user) {
  //console.log('用户已经存在');
  error = "该用户名已存在,请重新输入";
}else if (req.body.password !== req.body.repassword) {
  error = "两次密码输入不一致";
        //console.log("两次密码输入不一致");
  }
  if (error) {
        //将错误存入session
        req.session.error = error;
  //回到注册页面
  return res.redirect('/reg');
}
```
####3 个人信息
当用户为普通用户时，登录进聊天室后，通过点击左上角的用户头像进行个人信息的查看、修改。
>“查看”功能的实现原理是：当点击头像时，触发绑定在头像上的点击事件，在事件中，先异步根据用户ID去数据库中获取用户信息，然后触发模态框弹出事件，并对模态框进行渲染，使用模态框控件来展示用户信息。其效果界面如图5所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161031274-1433571805.png)

                                    图5  展示个人信息界面
 后台查询的mongoose代码如下：
```js
User.find({username:req.body.username},function(error,user){
               if(error){
                         res.send({ status:8000,msg   :"查询用户列表失败"});
               }else{
                        res.send({status:200,user:user});
               }
         })；
```

>有了查看功能，便引出了修改功能，在查看界面可以直接点击编辑按钮，从而触发编辑模态框的展示事件，先异步去获取该用户的信息，对模态框进行渲染，然后对输入框进行编辑，编辑完成后，点击确定按钮，首先会数据框的数据进行格式判断，然后将修改后的数据根据用户ID保存到数据库用户表中。其效果界面如图6所示。	
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161105836-905787105.png)

                                图6  编辑个人信息界面
      使用ajax进行异步修改，js部分代码如下所示：
```js
        $.ajax({
                    type:'post',
                    dataType:'json',
                    data:queryData,
                    url:'/compileUserInfo',
                    success:function(data){
                        if(data.status == 200){
                            alert(data.msg);
                         $('#compileUserInfoModel').modal('hide');//成功后将模态框关闭
                            //在这里进行input值得初始化
                        }else{
                            alert(data.msg);
                        }
                    },
                    error:function(e){
                        alert(e);
                    },
         })
```
         后台主要代码如下所示：
``` js
router.post('/compileUserInfo',function(req,res,next){
  var username = req.body.username;
  var oldValue = {username:req.body.username};
  varnewValue= 	{$set:{username:req.body.username  ,mail:req.body.mail,phone:req.body.phone,country:req.body.country,city:  req.body.city}};
  User.update(oldValue,newValue,function(err,result){
    if(err){
      res.send({status:8000,msg:"编辑用户信息失败"});
    }else{
      res.send({status:200, msg:"编辑用户信息成功"});
    }
  })
});
```
####4 密码修改
在聊天室左边的个人交互框中，点击系统设置，便找到了当前用户的密码修改。点击出现修改密码的模态框。其实现方法是先判断用户输入的原密码是否正确，然后判断新密码和重复输入的密码是否一致。通过判断条件后根据用户ID将用户密码修改为新密码保存到数据库中。其运行界面如图7所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161201368-36199592.png)


                                    图7  修改用户密码界面

        后台sql代码如下：
```js
User.update({username:username},{$set:{password:newPassword}},function(err,result){
      if(err){
        res.send({status:8000,msg:"修改用户密码失败"});
      }else{
        res.send({status:200,msg:"修改用户密码成功"});
      }
});
```
####5 好友管理
---
#####5.1 添加好友
聊天室的最右边，是当前系统中所有的用户列表，如果想要和某个用户进行私聊，就必须先添加该用户为好友。点击该系统用户，会弹出模态框显示是查看该用户信息还是添加该用户为好友。如图8所示。如若选择查看该用户信息，则会弹出展示该用户信息的模态框。当选择添加该用户为好友时，则向该用户发送好友请求，如果该用户同意，则二人便是好友关系，可以进行私聊了。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161226149-1969413102.png)

                                 图8  添加好友界面
       向特定的用户发送好友请求，是通过socket.io来实现的，具体实现的代码如下：
        用户列表中的聊天室用户绑定点击事件，在事件中会先去判断该用户是否已经是本用户的好友，代码如下：
```js
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
```
>经过判断该用户并不是你的好友，那么这时就可以向该用户发送好友请求了，需要准确的定位到该用户，从而保证不会将好友请求消息发给其他用户，执行下列代码：
```js
     this.socket.emit('sendFriendReq',target.innerHTML,USERNAME);
```
>该代码会定位到server.js中的sendFriendReq事件，在server.js中，采用广播机制，将这条好友请求消息发送给当前连接WS协议的所有用户，每个用户根据请求消息中的请求对象去判断是不是自己的请求消息，如果是，就做出相应的处理，如果不是，就将此消息进行忽略。其实现的相应逻辑代码如下所示：
```js
   socket.on('sendFriendReq',function(toOne,fromOne){
            //服务器server.js端执行的代码。相应的去触发每个用户的addFriReq事件。
            socket.broadcast.emit('addFriReq',toOne,fromOne);
      });
      //客户端对于服务器端的addFriReq事件进行处理。
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
```
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161259086-492220944.png)

                                    图9  删除好友界面
#####5.2 删除好友
聊天交友，难免会有人看谁不顺眼，恰巧这个人又是该用户的好友，这时就想要将此好友给删了，这时在好友列表中对着该好友右键，便可选择将该好友删除。其界面如上图9所示。

---

####6.1 私聊好友
   当有悄悄话想要和好友进行诉说的时候，这时候就要和该好友进行私聊了，在好友列表鼠标左键点击该好友，便会看到聊天室中间弹出了私聊的窗口。它的实现原理是：点击该好友时，触发私聊窗口的弹出事件，并且将模型中保存聊天信息时的sayto字段设置为当前私聊对象的username。其界面如图10所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161326477-2069698704.png)

                                    图10  私聊好友界面
>该系统的实现原理是，根据消息列表的sayto字段来进行区分聊天对象，根据sayto字段去保存或查询出消息列表中的聊天记录。使用ajax去进行数据的请求和保存，并且双方会根据socket.io来指向特定的用户去响应聊天渲染事件。Js代码如下：
```js
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
                        msgToDisplay.innerHTML = data.msg[i].username + 
                        '<span class="timespan"></span>' + data.msg[i].content;
                        container.appendChild(msgToDisplay);
                        container.scrollTop = container.scrollHeight;
                    }
                }
           },
```
####6.2 群聊好友

   当系统用户想要进行方便且快速的传播消息时，这时用户可以使用群聊功能，在左侧群组列表里点击相应的聊天群，便可以进入到相应的群组聊天室，在这里所有的用户可以畅所欲言。效果如图11所示。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161429071-1763777728.png)

                                    图11  好友群聊界面
###7 后台管理
####7.1 后台登录员登录

>后台管理员登录的设计模式和用户登录模式相同，当前系统设定的有一个超级管理员，超级管理员用户名为“zidingyi”，密码为“123456”。
在超级管理员登录时，后台判断到是“系统管理员”，然后就跳转到我们的后台管理界面。后台管理有三大模块：用户管理模块、聊天信息管理模块、管理员信息修改模块、管理员地图位置查看模块。

####7.2 后台用户管理模块
>“用户管理”功能可以进行根据用户名的搜索查找。同时，可以对用户进行删除、禁用、编辑等操作。设计原理是使用jqueryForm配合着node.js+mongoose的后台进行数据库中用用户列表的检索。其中运行图如图12。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161541477-430236398.png)

                                    图12  后台用户管理界面
 查看所有用户信息的后台sql语句为：
``` js
User.find({},function(error,user){
    res.render('adminFriendList',{userList:user});
});
```
点击禁用，会在后台将该用户的disabled属性设置为true，同时，该条记录的背景颜色会被改成红色表示禁止使用的账号。如果再使用该账号进行登录，前台会报错为该账号已经被禁止使用。其后台效果如图5-13后台用户管理界面所示。
点击修改，则传递选中行的用户ID，主要实现和在聊天室修改个人信息相同。
点击删除，则传递选中行的用户ID，将该用户从用户列表中进行删除。


![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161556446-359727278.png)

                                图13  后台禁止用户界面
####7.3 后台聊天信息管理模块
“聊天信息管理”功能可以进行根据发送者用户名搜索查找、也可以根据接受者用户名搜索查找聊天信息。其中运行图如图14。
![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161620774-607757793.png)

                                图14  后台聊天信息管理界面
   查看所有聊天信息并进行后台分页的mongoose语句为：
```js
router.post('/msgList',function(req,res,next){
  var sendMsg    = req.body.sendMsg;
  var acceptMsg  = req.body.acceptMsg;
  var pageIndex  = req.body.pageIndex;
  var pageSize   = req.body.pageSize;
  var searchData = {};
  if(sendMsg!=""&& sendMsg!=null){
    searchData.username = sendMsg;
  }
  if(acceptMsg!="" && acceptMsg !=null){
    searchData.sayto   = acceptMsg;
  }
  var a = 0;
  var msgCount = "";
  Message.find({},function(error,msgList){
    msgCount = msgList.length;
    Message.find(searchData)
      .skip(parseInt(pageIndex)*parseInt(pageSize))
      .limit(parseInt(pageSize))
      .exec(function(error,msgList){
      res.send({
          msgList:msgList,
          totalPages:Math.ceil(msgCount/pageSize),
          totalElements:msgCount
      });
    });
  });
});
```
另外，在图14中点击修改按钮，则传递选中行的聊天信息ID，弹出修改模态框，可以点击进行修改，其效果如图15所示。
同理，在图14中点击删除按钮，则传递选中行的聊天信息ID，将该条消息从消息列表中进行删除。

![](http://images2015.cnblogs.com/blog/998371/201706/998371-20170603161645946-1886099260.png)

                        图5-15  修改聊天信息界面

>上述为该系统的整体实现的部分，当然系统的完善度以及可扩展性都不算特别高，还有待进一步的开发与拓展。对于系统的扩展，有想法的童鞋可以和我联系，来呀，一起搞呀！！！

##系统安装运行

> * 首先要安装的是node.js环境，安装好之后会自带有npm
> * 然后使用npm install安装所需的各个第三方组件，这些组件在package.json中都已有，只需install就行了
> * 然后需要在本地安装MongoDB,这个安装介绍起来说麻烦也麻烦，说简单也简单，而且网上已经有好多安装教程，如果大家对于MongoDB还不是特别了解的话，可以去搜索学习一下，这里给大家推荐菜鸟教程的讲解
http://www.runoob.com/mongodb/mongodb-window-install.html
> * 安装好上述所有环境之后，先在本地运行起来MongoDB,然后执行node server,就可以打开本地locallhost:3000/login进行登录注册了。

##代码开源
> * 所写的代码也不多，还有待进一步的重构与整理，这里上传到了github，下边贴出我github的地址，大家就手动的点个星吧，万分感谢！！！
https://github.com/Blackgan3/WeChat
> * 当然，网页版的聊天室，不部署到线上怎么能行呢，自己买了个服务器来玩，现在项目已经部署到了线上，正在考虑可以加一个机器人。哈哈
http://www.blackgan.cn


##总结
---
从开始决定要做一个聊天系统，自己也觉得是不是不可能，当时也很没自信去说自己能去做一个独立的前台和后台系统，但是但是想的就是害怕什么呢，做不出来能死吗？如果只是想，而不去干，那你永远也不会得到什么。于是边去一遍调研，一遍尝试些写，当然白天还是要工作的，一般都是晚上下班后写一点，遇到不会的每天再学一点。现在系统已经粗糙的成了个大概的雏形。

当朋友使用这个系统在网上聊天，发送过去消息成功的时候，内心是很激动的，或许这不是最好的，这个系统也不会给我带来什么经济效益，但从那一刻起，我至少明白了，要敢想敢做！加油。


------------补充--------------
最近有小伙伴反馈运行不起来项目，大部分都是mongodb没有运行起来。

具体的安装套路，在上边有说明，可以去菜鸟网站学习或者直接百度。

安装成功之后，当能够使用mongod 命令运行