var $ = require('../lib/jquery-2.0.3.min.js')
var Toast = require('../module/toast.js').Toast
var Events = require('../module/event.js')
var waterfall = require('../module/waterfall.js')
var note = require('../module/note.js').note
require('../../less/index.less')

Events.on('toast',Toast)
Events.on('waterfall',function(obj){
    waterfall.init(obj)
})// 防止waterfull内部的this变，不能直接用waterfall.init

function load(){
    $.ajax({
        url: '/api/notes',
        method: 'GET'
    }).done(function(res){
        if(res.status===0){
            if(res.data.length){
                $.each(res.data,function(idx,ele){   //res.data 所有note的信息对象，每个note信息对象包含id,content,username属性
                    new note(ele)
                })
                Events.fire('waterfall',$('#container'))
            } 
        }else{
            Events.fire('toast',res.errorMsg)
        }
    }).fail(function(){
        Events.fire('toast','网络异常，加载失败')
    })
}
load()

$('.add-note').on('click',function(){
    new note()
})

