
/**
 * Created by Administrator on 2017/7/4.
 */

var express = require('express');
var User = require('../models/user.js');
var Avator = require('../models/avatar.js');
var Message = require('../models/message.js');
var FriendsList = require('../models/friendsList.js');
var router = express();
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable'),util = require('util'),fs = require('fs');

//保存上传的图片信息
router.post('/uploadAvator', function (req, res, next) {
    //处理上传的文件
    var form = new formidable.IncomingForm();
    var username = req.session.user.username;
    form.encoding = 'utf-8';
    form.uploadDir = './public/uploadAvator/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2* 1024*1024;
    form.parse(req,function(err,fields,files){
        console.log(files.userAvator.type);
        var extName = '';//后缀名
        switch (files.userAvator.type){
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;
        var mongoPath = '/uploadAvator/'+avatarName;
        fs.renameSync(files.userAvator.path, newPath);  //重命名
        console.log(files.userAvator.path);
        Avator.update({username:username},{$set:{avatarUrl: mongoPath}},function(err,result){
        });
        res.redirect('/login','post');
    });
    //res.send({status:200,data:'msg'});
});
module.exports=router;