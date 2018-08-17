var Sequelize = require('sequelize');
var path = require('path')

var sequelize = new Sequelize(undefined, undefined, undefined, {
  dialect: 'sqlite',
  storage: path.resolve(__dirname,'../database/database.sqlite')
})

var note = sequelize.define('note', {
    content: {
      type: Sequelize.STRING
    },
    userid: {
      type: Sequelize.STRING
    }
  });// 定义数据库列表样式
  
  // force: true will drop the table if it already exists
  // note.sync({force: true})

module.exports.note = note

