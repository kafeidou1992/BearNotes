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
        this.obj = $.extend({},this.defaultObj,obj||{}) // 新建未添加保存的note的初始id为''
    },
    creatNote: function(){
        this.$note = $('<div class="note">'
            +'<div class="note-header clearfix"><span class="corner"></span><span class="title">Bear Notes</span><span class="delete">&times;</span></div>'
            +'<div class="note-content" contenteditable="true"></div>'
            +'</div>')
        this.$note.prependTo('#container')
        this.$noteContent = this.$note.find('.note-content')
        this.noteContent = this.$noteContent[0]
        this.$noteHeader = this.$note.find('.note-header')
        this.noteContent.innerText = this.obj.content  //jquery的text方法会忽略换行符，原生dom的innerText不会
    },
    setStyle: function(){
        if(this.obj.id===''){
            this.$note.css('z-index',this.maxZindex()+1+'')
        }   // 设置新增的note位于其他note上方
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
            self.isClickDelete = true
            if(self.obj.id===''){
                self.$note.remove()
            }else{
                self.delete()
            }  
        })

        //contenteditable属性的元素没有change事件，模拟change事件
        this.$noteContent.on('focus',function(){
            if(this.innerText==='input your content'){
                this.innerText = ''
            }
            $(this).data('beforeContent',this.innerText)
            self.$note.css('z-index',self.maxZindex()+1+'')      //更改某个note时，该note的位置位于其他note上方
        }).on('blur',function(){
            var _this = this
            setTimeout(function(){
                if(!self.isClickDelete){     // 点击delete时触发的blur, 不执行正常blur的处理逻辑
                    self.$note.css('z-index','-=1')
                    if(_this.innerText===''){
                        if(self.obj.id===''){
                            self.$note.remove()
                        }else{
                            self.delete()
                        }  
                        return
                    }   
                    if($(_this).data('beforeContent')!==_this.innerText){
                        $(_this).data('beforeContent',_this.innerText)
                        if(self.obj.id===''){
                            self.add()
                        }else{
                            self.edit()
                        }
                    }
                }
            },200)
        }).on('paste',function(e){
            e.preventDefault()
            var text = e.originalEvent.clipboardData.getData('text')
            document.execCommand('insertText', false, text)    //去除粘贴内容的样式

            if($(this).data('beforeContent')!==this.innerText){
                $(this).data('beforeContent',this.innerText)
                if(self.obj.id===''){
                    self.add()
                }else{
                    self.edit()
                }
            } 
        })      

        this.$noteHeader.on('mousedown',function(e){
            self.$note.css('z-index',self.maxZindex()+1+'')   //拖动某个note时，该note的位置位于其他note上方
            self.$note.addClass('drag')
            self.$note.data('offset',{
                x: e.pageX - self.$note.offset().left,
                y: e.pageY - self.$note.offset().top
            })                                         //记录note与鼠标初始位置的相对距离
        }).on('mouseup',function(){
            self.$note.removeClass('drag')
        })
          
        $(document).on('mousemove',function(e){
            if(self.$note.hasClass('drag')){
                self.$note.offset({
                    left: e.pageX - self.$note.data('offset').x,
                    top: e.pageY- self.$note.data('offset').y     // 拖动时保证note与鼠标之间的相对距离不变
                })
            }
        })        
    },
    maxZindex: function(){
        if($('.note').length){
            var zindexArr = []
            $('.note').each(function(){
                zindexArr.push(parseInt($(this).css('z-index'))) 
            })
            return Math.max.apply(undefined,zindexArr)
        }
        return 0
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
                setTimeout(function(){me.isClickDelete = false},300) 
                Events.fire('toast',res.errorMsg) //res.status不为0时，输出res的errorMsg
            }
        }).fail(function(){
            setTimeout(function(){me.isClickDelete = false},300)
            Events.fire('toast','网络异常，删除失败')
        })
    },
    add: function(){
        var me = this
        $.ajax({
            url: '/api/notes/add',
            method: 'POST',
            data: {
                content: me.noteContent.innerText
            }
        }).done(function(res){
            if(res.status===0){
                me.obj.id = res.id 
                Events.fire('toast','添加成功')
                Events.fire('waterfall',$('#container'))   
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
                content: me.noteContent.innerText
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