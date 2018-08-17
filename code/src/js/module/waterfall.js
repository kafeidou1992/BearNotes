var $ = require('../lib/jquery-2.0.3.min.js')

var waterfall = (function(){
    function init($ct){
        this.$container = $ct
        this.layout()
        this.bind()
    }
    function bind(){
        var self = this
        $(window).off('resize').on('resize',function(){
            self.layout()
        })
    }
    function layout(){
        this.noteWidth = this.$container.children().outerWidth(true)
        this.rowCount = Math.floor(this.$container.width()/this.noteWidth)
        this.heightArray = []
        for(var i=0; i<this.rowCount; i++){
            this.heightArray[i]=0
        }
        var self = this
        this.$container.children().each(function(){
            self.minHeight = Math.min.apply(undefined,self.heightArray)
            self.minIdx = self.heightArray.indexOf(self.minHeight)
            $(this).css({
                left: self.noteWidth*self.minIdx,
                top: self.minHeight
            })
            self.heightArray[self.minIdx] += $(this).outerHeight(true)
        })
        this.$container.css('height',Math.max.apply(undefined,this.heightArray))
    }
    return {
        init: init,
        bind: bind,
        layout: layout
    }
})()
module.exports =  waterfall