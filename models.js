var mongoose = require('mongoose');
var schema   = mongoose.Schema;

var _Users = new Schema({
	username:String,
	password:String,
	email:String,
});

exports.Users = mongoose.model('Users',_Users);