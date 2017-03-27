var express = require('express');
var User = require('../models/user.js')
var Message = require('../models/message.js')
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
  	//1.查询数据库,判断当前的用户名是否存在
  	User.findOne({username:req.body.username},function (error,user) {
  		//用户已经存在
  		if (user) {
  			//console.log('用户已经存在');
  			error = "该用户名已存在,请重新输入";
  		}else if (req.body.password !== req.body.repassword) {
        console.log(req.body.password);
        console.log(req.body.repassword);
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
          req.session.error = "注册失败";
          console.log("注册失败");
          return res.redirect('/reg');
        }
  		})

  	})

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
      res.render('chatHome',{
        user:user,
      });
  })
});


//发消息，然后存入到数据库中
router.post('/postmsg', function(req, res, next) {
  //处理发送的微博
  var msg = new Message({
    username:req.session.user.username,
    content:req.body.msg,
    publishTime:new Date()
  })
  msg.save(function (error) {
    if (!error) {
      console.log('发送成功');
      res.send({status:200,msg:"信息保存成功"});
    }else{
      res.send({status:8000,msg:"信息保存失败"});
    }
  })
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

//保存好友进入好友表中，包括同意了别人的请求以及别人同意了我的好友请求
router.get('/saveFriend',function(req,res,next){

});
//发送好友请求，将好友请求写进对方的数据库中？？？？？

module.exports = router;
