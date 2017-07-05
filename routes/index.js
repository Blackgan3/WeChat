
var express = require('express');
var User = require('../models/user.js');
var Avator = require('../models/avatar.js');
var Message = require('../models/message.js');
var FriendsList = require('../models/friendsList.js');
var router = express();
var ObjectID = require('mongodb').ObjectID;
/* GET home page. */

//首页
router.get('/', function (req, res, next) {
    res.render('login');
});

//进入主页
router.get('/chatHome', function (req, res, next) {
    res.render('chatHome');
});

//进入注册页面
router.get('/reg', function (req, res, next) {
    res.render('reg', {status: 'reg'});
});
//注册操作
router.post('/reg', function (req, res, next) {
    //1.查询数据库,判断当前的用户名是否存在
    User.findOne({username: req.body.username}, function (error, user) {
        //用户已经存在
        if (user) {
            //console.log('用户已经存在');
            error = "该用户名已存在,请重新输入";
        } else if (req.body.password !== req.body.repassword) {
            error = "两次密码输入不一致";
        }
        if (error) {
            //将错误存入session
            req.session.error = error;
            //回到注册页面
            return res.redirect('/reg');
        }
        //用户名可以用
        var user = new User({
            username: req.body.username,
            password: req.body.password,
            userImage:req.body.userImage,
            disabled: false//false为不禁止，代表可用
        });
        //给当前用户随机分配一个默认头像
        var userIndex = parseInt(Math.random()*(15) + 1);
        var ava = new Avator({
            username : req.body.username,
            avatarUrl: '/images/defaultAvator/'+userIndex+'.jpg'
        });
        //存入数据库
        user.save(function (error) {
            if (!error) {
                req.session.success = '注册成功';
                console.log("注册成功");
                return res.redirect('/');
            } else {
                req.session.error = "注册失败";
                console.log("注册失败");
                return res.redirect('/reg');
            }
        });
        ava.save();

    })

});
//进入登陆
router.get('/login', function (req, res, next) {

    //取出所有的,显示
    res.render('login');
});
//登录操作
router.post('/login', function (req, res, next) {
    //判断用户名是否存在
    var loginInfo = {};
    var promise = new Promise(function(resolve, reject) {
        console.log('Promise');
        User.findOne({username: req.body.username}, function (error, user) {
            if (!user) {
                //用户名不存在
                error = "用户名不存在,请先去注册";
            } else if (req.body.password !== user.password) {
                error = "密码输入错误";
            } else if (user.disabled == true) {
                error = "对不起，该账号已被禁止使用"
            }
            if (error) {
                req.session.error = error;
                //跳转路由
                return res.redirect('/login');
            }
            req.session.success = '登录成功';
            //跳转到首页
            req.session.user = user;
            loginInfo.user = user;


            resolve();
        });

    });
    promise.then(function(){
        Avator.findOne({username:req.body.username},function(error,userLogo){
            loginInfo.userLogo = userLogo;
            console.log('Hi!');
            console.log(loginInfo);
            // return false;
            if (loginInfo.user.username === 'weChatAdmin') {
                //如果是管理员登录,就登录到管理员界面
                res.render('adminHome', loginInfo);
            } else {
                res.render('chatHome', loginInfo);
            }
        });
    });

});
//保存修改后的用户信息
router.post('/compileUserInfo', function (req, res, next) {
    var username = req.body.username;
    var oldValue = {username: req.body.username};
    var newValue = {
        $set: {
            username: req.body.username,
            mail: req.body.mail,
            phone: req.body.phone,
            country: req.body.country,
            city: req.body.city,
            signature: req.body.signature
        }
    };

    User.update(oldValue, newValue, function (error, result) {
        if (error) {
            res.send({status: 8000, msg: "编辑用户信息失败"});
        } else {
            res.send({status: 200, msg: "编辑用户信息成功"});
            consle.log(result);
        }
    })
});
//进行保存修改密码的操作
router.post('/modifyPassword', function (req, res, next) {
    var newPassword = req.body.newPassword,
        username = req.body.username;
    User.update({username: username}, {$set: {password: newPassword}}, function (err, result) {
        if (err) {
            res.send({status: 8000, msg: "修改用户密码失败"});
        } else {
            res.send({status: 200, msg: "修改用户密码成功"});
        }
    });

});
//发消息，然后存入到数据库中
router.post('/postmsg', function (req, res, next) {
    //处理发送的微博
    var msg = new Message({
        username: req.body.username,
        content: req.body.msg,
        publishTime: new Date(),
        sayto: req.body.sayto
    });
    msg.save(function (error) {
        if (!error) {
            console.log('发送成功');
            res.send({status: 200, msg: "信息保存成功"});
        } else {
            res.send({status: 8000, msg: "信息保存失败"});
        }
    })
});
//获取到当前聊天信息列表
router.post('/getChatMsg', function (req, res, next) {
    var sayto = req.body.sayto;
    var fromto = req.body.fromto;
    //查询当前私聊双方的的私聊信息
    Message.find({
        $or: [{'username': fromto, 'sayto': sayto}, {
            'username': sayto,
            'sayto': fromto
        }]
    }, function (error, Msg) {
        if (error) {
            res.send({status: 8000, msg: "查询当前聊天信息失败"});
        } else {
            res.send({status: 200, msg: Msg});
        }
    });
});
//获取当前的群聊消息列表
router.post('/getGroupChatMsg', function (req, res, next) {
    var sayto = req.body.sayto;
    var fromto = req.body.fromto;
    //查询当前私聊双方的的私聊信息
    Message.find({sayto: sayto}, function (error, Msg) {
        if (error) {
            res.send({status: 8000, msg: "查询群组聊天信息失败"});
        } else {
            res.send({status: 200, msg: Msg});
        }
    });
});
//获取到当前用户列表
router.get('/getOnLineUser', function (req, res, next) {
    User.find({}, function (error, user) {
        if (error) {
            res.send({
                status: 8000,
                msg: "查询用户列表失败"
            });
        } else {
            res.send(user);
        }
    });
});
//查看当前用户信息
router.post('/lookUserInfo', function (req, res, next) {
    var username = req.body.username;
    User.findOne({username: username}, function (error, user) {
        res.send({status: 200, user: user});
    })
});

//--------------------好友处理方面----------------------------------
//发送好友请求，将好友请求写进对方的数据库中
router.post('/saveFriRelation', function (req, res, next) {
    //res.render('login');
    var fri = new FriendsList({
        master: req.body.master,
        friend: req.body.friend
    });
    var fri2 = new FriendsList({
        master: req.body.friend,
        friend: req.body.master
    });
    fri.save(function (error) {
        if (error) {
            res.send({status: 8000, msg: "添加好友关系失败"});
        } else {
            res.send({status: 200, msg: "添加好友关系成功"});
        }
    });
    fri2.save();
});

router.post('/getFriList', function (req, res, next) {
    FriendsList.find({master: req.body.master}, function (error, friendsList) {
        if (error) {
            res.send({status: 8000, msg: '查询用户好友列表失败'});
        } else {
            res.send(friendsList);
        }
    });
});

//判断当前用户请求的对象是否已经是好友了
router.post('/judgeFriend', function (req, res, next) {
    FriendsList.findOne({master: req.body.master, friend: req.body.friend}, function (error, friendsList) {
        console.log(friendsList);
        if (friendsList) {
            res.send({status: 8000, msg: "当前用户已是你的好友"});
        } else {
            res.send({status: 200, msg: "当前用户还不是你的好友"});
        }
    })
})
module.exports = router;


//后台的一系列操作和跳转
router.get('/friendList', function (req, res, next) {
    User.find({}, function (error, user) {
        res.render('adminFriendList', {userList: user});
    });
});
router.get('/adminHome', function (req, res, next) {
    res.render('adminHome');
});
router.get('/msgList', function (req, res, next) {
    Message.find({}, function (error, msgList) {
        res.render('adminMsgList', {msgList: msgList});
    });
});
//获得聊天信息列表(分页，查询)
router.post('/msgList', function (req, res, next) {
    var sendMsg = req.body.sendMsg;
    var acceptMsg = req.body.acceptMsg;
    var pageIndex = req.body.pageIndex;
    var pageSize = req.body.pageSize;
    var searchData = {};
    if (sendMsg != "" && sendMsg != null) {
        searchData.username = sendMsg;
    }
    if (acceptMsg != "" && acceptMsg != null) {
        searchData.sayto = acceptMsg;
    }
    var a = 0;
    var msgCount = "";
    Message.find({}, function (error, msgList) {
        msgCount = msgList.length;
        Message.find(searchData)
            .skip(parseInt(pageIndex) * parseInt(pageSize))
            .limit(parseInt(pageSize))
            .exec(function (error, msgList) {
                res.send({
                    msgList: msgList,
                    totalPages: Math.ceil(msgCount / pageSize),
                    totalElements: msgCount
                });
            });
    });
});

/* Message.find(searchData,null,{skip: 0, limit: 10, sort:{ "-createtime":1}},function(error,msgList){
 res.send({msgList:msgList});
 });*/

router.post('/msgList', function (req, res, next) {
    var sendMsg = req.body.sendMsg;
    var acceptMsg = req.body.acceptMsg;
    Message.find({username: sendMsg}, function (error, msgList) {
        res.send({msgList: msgList});
    });
});
//删除指定的用户
router.post('/removeUser', function (req, res, next) {
    User.remove({username: req.body.username}, function (err, doc) {
        if (err) {
            res.send({status: 8000, msg: "删除用户失败"});
        } else {
            res.send({status: 200, msg: "成功删除该用户"});
        }
    });
});
//禁止指定的用户登录
router.post('/disabledUser', function (req, res, next) {
    var username = req.body.username;
    User.update({username: username}, {$set: {disabled: true}}, function (err, result) {
        if (err) {
            res.send({status: 8000, msg: "禁止该用户失败"});
        } else {
            res.send({status: 200, msg: "禁止该用户成功"});
        }
    });
});
//删除指定的聊天消息
router.post('/deleteMsg',function(req,res,next){
    var id = req.body.id;
    Message.remove({_id:new ObjectID(id)},function(err,doc){
        if(err){
            res.send({status:8000,msg:"删除信息失败"});
        }else{
            res.send({status:200, msg:"删除信息成功"});
        }
    })
});
router.post('/lookMsgDetail',function(req,res,next){
    var id = req.body.id;
    Message.findOne({_id:new ObjectID(id)},function(err,doc){
        if(err){
            res.send({status:8000,msg:'查看聊天信息失败'});
        }else{
            res.send({status:200, msg:doc});
        }
    })
});
router.post('/compileMsgDetail',function(req,res,next){
    var id = req.body.id;
    var oldValue = {_id:new ObjectID(id)};
    var newValue = {
        $set: {
            _id: new ObjectID(id),
            username: req.body.username,
            content: req.body.content,
            sayto: req.body.sayto,
        }
    };
    Message.update(oldValue,newValue,function(err,doc){
        if(err){
            res.send({status:8000,msg:'编辑聊天信息成功'});
        }else{
            res.send({status:200, msg:'编辑聊天信息失败'});
        }
    })
});