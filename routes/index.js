var express     = require('express');
var User        = require('../models/user.js');
var Message     = require('../models/message.js');
var FriendsList = require('../models/friendsList.js');
var router = express();

/* GET home page. */

//首页
router.get('/', function(req, res, next) {
  res.render('login');
});

//进入主页
router.get('/chatHome', function(req, res, next) {
  res.render('chatHome');
});

//进入注册页面
router.get('/reg', function(req, res, next) {
  res.render('reg', { status: 'reg'});
});
//注册操作
router.post('/reg', function(req, res, next) {
<<<<<<< HEAD
    //1.查询数据库,判断当前的用户名是否存在
    User.findOne({username:req.body.username},function (error,user) {
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
      console.log(error);

      //用户名可以用
      var user = new User({
        username:req.body.username,
        password:req.body.password
      })

      //存入数据库
      user.save(function (error) {
        if (!error) {
          req.session.success = '注册成功';
          console.log("注册成功");
          return res.redirect('/');
        }else{
=======
  	//1.查询数据库,判断当前的用户名是否存在
  	User.findOne({username:req.body.username},function (error,user) {
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
      console.log(error);

  		//用户名可以用
  		var user = new User({
  			username:req.body.username,
  			password:req.body.password
  		})

  		//存入数据库
  		user.save(function (error) {
  			if (!error) {
  				req.session.success = '注册成功';
          console.log("注册成功");
  				return res.redirect('/');
  			}else{
>>>>>>> temp
          req.session.error = "注册失败";
          console.log("注册失败");
          return res.redirect('/reg');
        }
<<<<<<< HEAD
      })

    })
=======
  		})

  	})
>>>>>>> temp

});
//进入登陆
router.get('/login', function(req, res, next) {

  //取出所有的微博,显示
    res.render('login');
});
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
<<<<<<< HEAD
      console.log(user);
=======
>>>>>>> temp
  })
});


//发消息，然后存入到数据库中
router.post('/postmsg', function(req, res, next) {
  //处理发送的微博
  var msg = new Message({
    username   :req.body.username,
    content    :req.body.msg,
    publishTime:new Date(),
    sayto      :req.body.sayto
  });
  msg.save(function (error) {
    if (!error) {
      console.log('发送成功');
      res.send({status:200,msg:"信息保存成功"});
    }else{
      res.send({status:8000,msg:"信息保存失败"});
    }
  })
});
//获取到当前聊天信息列表
router.post('/getChatMsg',function(req,res,next){
    var sayto = req.body.sayto;
    var fromto= req.body.fromto;
    //查询当前私聊双方的的私聊信息
    Message.find({$or:[{'username':fromto,'sayto':sayto},{'username':sayto,'sayto':fromto}]},function(error,Msg){
      if(error){
        res.send({status:8000,msg:"查询当前聊天信息失败"});
      }else{
        res.send({status:200, msg:Msg});
      }
    });
});
//获取到当前用户列表
router.get('/getOnLineUser',function(req,res,next){
    User.find({},function(error,user){
      if(error){
        res.send({
          status:8000,
          msg   :"查询用户列表失败"
        });
      }else{
        res.send(user);
      }
    });
});
//--------------------好友处理方面----------------------------------
//发送好友请求，将好友请求写进对方的数据库中
router.post('/saveFriRelation', function(req, res, next) {
  //res.render('login');
  var fri = new FriendsList({
      master:req.body.master,
      friend:req.body.friend
  });
  var fri2= new FriendsList({
      master:req.body.friend,
      friend:req.body.master
  });
  fri.save(function(error){
    if(error){
      res.send({status:8000,msg:"添加好友关系失败"});
    }else{
      res.send({status:200,msg:"添加好友关系成功"});
    } 
  });
  fri2.save();
});

router.post('/getFriList',function(req,res,next){
  FriendsList.find({master:req.body.master},function (error,friendsList) {
      if (error) {
        res.send({status:8000,msg:'查询用户好友列表失败'});
      }else{
        res.send(friendsList);
      }
  });
});

module.exports = router;


//后台的一系列操作和跳转
router.get('/friendList',function(req,res,next){
    User.find({},function(error,user){
        res.render('adminFriendList',{userList:user});
    });
});
router.get('/adminHome',function(req,res,next){
    res.render('adminHome');
});
router.get('/msgList',function(req,res,next){
  Message.find({},function(error,msgList){
    res.render('adminMsgList',{msgList:msgList});
  });
});
<<<<<<< HEAD
//获得聊天信息列表(分页，查询)
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
  })
  })
 
 /* Message.find(searchData,null,{skip: 0, limit: 10, sort:{ "-createtime":1}},function(error,msgList){
    res.send({msgList:msgList});     
  });*/

=======
router.post('/msgList',function(req,res,next){
  var sendMsg   = req.body.sendMsg;
  var acceptMsg = req.body.acceptMsg;
  Message.find({username:sendMsg},function(error,msgList){
    res.send({msgList:msgList});
  });
>>>>>>> temp
});
//删除指定的用户
router.post('/removeUser',function(req,res,next){
    User.remove({username:req.body.username},function(err,doc){
        if(err){
            res.send({status:8000,msg:"删除用户失败"});
        }else{
            res.send({status:200, msg:"成功删除该用户"});
        }
    });
});