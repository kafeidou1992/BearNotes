var express = require('express');
var router = express.Router();
var note = require('../data-mod/note.js').note

/* GET users listing. */
router.get('/notes', function(req, res, next) {
  if(req.session.user){
    note.findAll({raw: true, where: {userid: req.session.user.userid}}).then(function(data){
      res.send({status: 0, data: data})
    }).catch(function(){
      res.send({status: 1,errorMsg: '数据查找失败'})
    })
  }else{
    res.send({status: 0, data: []})
  }
});

router.post('/notes/add', function(req, res, next) {
  if(req.session.user){
    note.create({content: req.body.content, userid: req.session.user.userid}).then(function(data){
      res.send({status: 0, id: data.dataValues.id})
    }).catch(function(){
      res.send({status: 1,errorMsg: '数据添加失败'})
    })
  }else{
    res.send({status: 1,errorMsg: '请先登录,不登录不会保存哦！'})
  }
});

router.post('/notes/edit', function(req, res, next) {
  if(req.session.user){
    note.update({content: req.body.content},{where: {id: req.body.id, userid: req.session.user.userid}}).then(function(){
      res.send({status: 0})
    }).catch(function(){
      res.send({status: 1,errorMsg: '数据修改失败'})
    })
  }else{
    res.send({status: 1,errorMsg: '请先登录,不登录不会保存哦！'})
  } 
});

router.post('/notes/delete', function(req, res, next) {
  if(req.session.user){
    note.destroy({where: {id: req.body.id, userid: req.session.user.userid}}).then(function(){
      res.send({status: 0})
    }).catch(function(){
      res.send({status: 1,errorMsg: '数据删除失败'})
    })
  }else{
    res.send({status: 1,errorMsg: '请先登录,不登录不会保存哦！'})
  } 
});

module.exports = router;
