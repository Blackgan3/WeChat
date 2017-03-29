var express = require('express'),
    app = express(),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    //导入express-session中间件,用于处理session
    session = require('express-session'),
    routes  = require('./routes/index'),
   /* models = require('./models');
    Users  = models.Users;*/
    //导入设置好的数据模型
    users = [];

// app.use('/', express.static(__dirname + '/www'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//使用session中间件
app.use(session({
  secret:'dahsdjasu423u4329'//此选项用于加密session
}));
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 4000);//publish to heroku
//自定义中间件（拦截器）
app.use(function(req,res,next){
    //将错误显示到模板中(给res.locals设置的属性可以直接用在模板中)
    res.locals.error = req.session.error;
    //删除session中的error;
    delete req.session.error;

    res.locals.success = req.session.success;
    delete req.session.success;
    //用户登录后，将用户的信息存入locals，用于模板引擎；
   /* if(req.session.user){
        res.locals.user = req.sessoin.user;
    }*/
    //交给下一个中间件处理
    next();

});
app.use('/', routes);
// app.use('/friend',routes.friend);
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
        socket.nickname = nickname;
        users.push(nickname);
        socket.emit('loginSuccess');
        io.sockets.emit('system', nickname, users.length, 'login');
    });
    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //new Message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });

    //处理新发送来的信息
    socket.on('saveMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });

    //处理新发送来的图片
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
    //去用户列表请求数据渲染出当前用户列表中的用户
    socket.on('onLineUser',function(){
        socket.broadcast.emit('addUser');
        socket.emit('addUser');
    });
    //接收到发送好友的请求
    socket.on('sendFriendReq',function(toOne,fromOne){
        socket.broadcast.emit('addFriReq',toOne,fromOne);
    });
    //好友请求遭到拒绝
    socket.on('refuseReq',function(toOne,fromOne){
        socket.broadcast.emit('refuseReqAssign',toOne,fromOne);
    });
    //好友请求成功通过
    socket.on('agreeReq',function(toOne,fromOne){
        socket.broadcast.emit('agreeReqAssign',toOne,fromOne);
    })
});

module.exports = app;
