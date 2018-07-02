var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var logData
  if(req.session.user){
    logData = {
      isLogin: true,
      user: {
        avatar: req.session.user.avatar,
        name: req.session.user.username
      }
    }
  }else{
    logData = {
      isLogin: false
    }
  }
  res.render('index', logData);
});

module.exports = router;
