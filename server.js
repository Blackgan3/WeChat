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
    routes = require('./routes/index'),
   /* models = require('./models');
    Users  = models.Users;*/
    //导入设置好的路由

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
    console.log(req.session);
   /* if(req.session.user){
        res.locals.user = req.sessoin.user;
    }*/
    //交给下一个中间件处理
    next();

});
app.use('/', routes);

io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
      /*  if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {*/
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
      /*  };*/
    });
    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});




module.exports = app;
