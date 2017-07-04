/**
 * Created by Administrator on 2017/7/4.
 */
//存储用户的头像的url，每一个用户对应有一个头像
var mongoose = require('mongoose');
var userAvatar = mongoose.Schema({
    username  : String,
    avatarUrl : String
});
var avatarList = mongoose.model('avatarList',userAvatar);

module.exports = avatarList;