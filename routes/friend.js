var express = require('express');
var User = require('../models/user.js');
var Message = require('../models/message.js');
var router = express();


router.post('/saveFriRelation', function(req, res, next) {
  res.render('login');
});
module.exports = router;
