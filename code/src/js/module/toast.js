var $ = require('../lib/jquery-2.0.3.min.js')
require('../../less/toast.less')

function toast(msg,time){
    this.msg = msg
    this.time = time || 1000
    this.creatToast()
    this.showToast()
}

toast.prototype = {
    constructor: toast,
    creatToast: function(){
       this.$toast = $('<div class="toast"></div>')
       this.$toast.text(this.msg)
       this.$toast.appendTo('body')
    },
    showToast: function(){
        var _this = this
        this.$toast.fadeIn(function(){
            setTimeout(function(){
                _this.$toast.fadeOut(function(){
                    _this.$toast.remove()
                })
            },_this.time) 
        })
    }
}

function Toast(msg,time){
    return new toast(msg,time)
}

module.exports.Toast = Toast
