
var mongoose = require('mongoose');
//定义集合(表)的数据结构  User
var MessageSchema = mongoose.Schema({
	username   : String,
	content    : String,
	publishTime: Date,
	sayto      : String,
});

//定义了一个消息集合(表)
var Message = mongoose.model('Message',MessageSchema);

//暴露出消息体
module.exports = Message;