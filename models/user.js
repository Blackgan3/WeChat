//链接数据库
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/weibo',function (error) {
	if (!error) {
		console.log('连接成功');
	}else{
		console.log(error);
	}
});
//定义集合(表)的数据结构  User
var UserSchema = mongoose.Schema({
	username: String,
	password: String,
	mail    : String,
	signature:String,
	country : String,
	city    : String,
	phone   : Number,
});

//定义了一个User集合(表)
var User = mongoose.model('User',UserSchema);//users

//导出User
module.exports = User;