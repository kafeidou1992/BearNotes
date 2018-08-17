require('../../less/node.less')
var $ = require('../lib/jquery-2.0.3.min.js')
var Events = require('./event.js')

function note(obj){
    this.defaultObj = {
        id: '',
        content: 'input your content'
    }
    this.color = ['#e78183','#a481e7','#81b1e7','#7dca70','#ffce7d'] // noteColor
    this.initObj(obj) 
    this.creatNote()
    this.setStyle()
    this.bind()
}

note.prototype = {
    constructor: note,
    initObj: function(obj){
        this.obj = $.extend({},this.defaultObj,obj||{}) // 初始id为''
    },
    creatNote: function(){
        this.$note = $('<div class="note">'
            +'<div class="note-header clearfix"><span class="corner"></span><span class="title">Bear Notes</span><span class="delete">&times;</span></div>'
            +'<div class="note-content" contenteditable="true"></div>'
            +'</div>')
        this.$note.prependTo('#container')
        this.$noteContent = this.$note.find('.note-content')
        this.$noteHeader = this.$note.find('.note-header')
        this.$noteContent.html(this.obj.content)
    },
    setStyle: function(){
       this.$note.css({
           top: '80px',
           left: 'calc(50% - 80px)',
           zIndex: this.maxZindex()+1+''
       })
       this.$noteCorner = this.$note.find('.corner')
       var color = this.color[Math.floor(Math.random()*5)]
       this.$noteCorner.css({
        borderLeftColor: color,
        borderTopColor: color
       })
    },
    bind: function(){
        var self = this
        this.$noteHeader.find('.delete').on('click',function(){
            if(self.obj.id===''){
                self.$note.remove()
            }else{
                self.delete()
            }  
        })

        //contenteditable属性的元素没有change事件
        this.$noteContent.on('focus',function(){
            if($(this).html()==='input your content'){
                $(this).html('')
            }
            $(this).data('beforeContent',$(this).html())
            self.$note.css('z-index',self.maxZindex()+1+'')      //更改某个note时，该note的位置位于其他note上方
        }).on('blur',function(){
            if($(this).text()===''){
                if(self.obj.id===''){
                    self.$note.remove()
                }else{
                    self.delete()
                }  
                return
            }   
            if($(this).data('beforeContent')!==$(this).html()){
                $(this).data('beforeContent',$(this).html())
                if(self.obj.id===''){
                    self.add()
                }else{
                    self.edit()
                }
            }
        }).on('paste',function(e){
            e.preventDefault()
            var text = e.originalEvent.clipboardData.getData('text')
            document.execCommand('insertText', false, text)    //去除粘贴内容的样式

            if($(this).data('beforeContent')!==$(this).html()){
                $(this).data('beforeContent',$(this).html())
                if(self.obj.id===''){
                    self.add()
                }else{
                    self.edit()
                }
            } 
        })      

        this.$noteHeader.on('mousedown',function(e){
            self.$note.css('z-index',self.maxZindex()+1+'')   ////拖动某个note时，该note的位置位于其他note上方
            self.$note.addClass('drag')
            self.offsetX = e.pageX - self.$note.offset().left
            self.offsetY = e.pageY - self.$note.offset().top  //记录note与鼠标初始位置的相对距离
        }).on('mouseup',function(){
            self.$note.removeClass('drag')
        })
          
        $(document).on('mousemove',function(e){
            if(self.$note.hasClass('drag')){
                self.$note.offset({
                left: e.pageX - self.offsetX,
                top: e.pageY- self.offsetY     // 拖动时保证note与鼠标之间的相对距离不变
                })
            }
        })        
    },
    maxZindex: function(){
        var zindexArr = []
        $('.note').each(function(){
            zindexArr.push(parseInt($(this).css('z-index'))) 
        })
        return Math.max.apply(undefined,zindexArr)
    },
    delete: function(){
        var me = this
        $.ajax({
            url: '/api/notes/delete',
            method: 'POST',
            data: {
                id: me.obj.id
            }
        }).done(function(res){
            if(res.status===0){     //res.status为0时，数据正常
                me.$note.remove()               
                Events.fire('waterfall',$('#container'))
                Events.fire('toast','删除成功') 
            }else{
                Events.fire('toast',res.errorMsg) //res.status不为0时，输出res的errorMsg
            }
        }).fail(function(){
            Events.fire('toast','网络异常，删除失败')
        })
    },
    add: function(){
        var me = this
        $.ajax({
            url: '/api/notes/add',
            method: 'POST',
            data: {
                content: me.$noteContent.html()
            }
        }).done(function(res){
            if(res.status===0){
                Events.fire('toast','添加成功')
                me.obj.id = res.id 
                setTimeout(function(){
                    Events.fire('waterfall',$('#container'))  
                },500)         // 处理新建note时,光标还在note内时点击delete,note不会删除，还会跟随鼠标移动的问题
            }else{
                me.$note.remove()
                Events.fire('toast',res.errorMsg) 
            }
        }).fail(function(){
            me.$note.remove()
            Events.fire('toast','网络异常，添加失败')
        })
    },
    edit: function(){
        var me = this
        $.ajax({
            url: '/api/notes/edit',
            method: 'POST',
            data: {
                id: me.obj.id,
                content: me.$noteContent.html()
            }
        }).done(function(res){
            if(res.status===0){     //res.status为0时，数据正常
                Events.fire('waterfall',$('#container'))
                Events.fire('toast','更新成功')
            }else{
                Events.fire('waterfall',$('#container'))
                Events.fire('toast',res.errorMsg) //res.status不为0时，输出res的errorMsg
            }
        }).fail(function(){
            Events.fire('waterfall',$('#container'))
            Events.fire('toast','网络异常，更新失败')
        })
    }
}

module.exports.note = note