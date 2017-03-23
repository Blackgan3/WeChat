var mongoose = require('mongoose');
//定义集合(表)的数据结构  User
var FriendsSchema = mongoose.Schema({
	username: String,
	friend: String,
})

//定义了一个消息集合(表)
var FriendsList = mongoose.model('FriendsList',FriendsSchema);

//暴露出消息体
module.exports = FriendsList;